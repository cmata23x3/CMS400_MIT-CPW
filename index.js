var cpwViz = angular.module('cpwViz', ['angularCharts'])
.value('filters', {
  'options': ['', 'Year', 'Course', 'Residence']
})
.service('dataSmashingService', function(initObj, filterData){
  var smashDataWorker = function(rawData, keys){
    var result = initObj.initArray(keys);
    var store = {}
    _.forEach(keys, function(key){
      store[key] = [];
    });

    _.forEach(rawData, function(entry){
      _.forEach(keys, function(key){
        var value = entry[key];
        if(_.isFinite(value)){
          store[key].push(value);
          var resultEntry = _.find(result, _.matchesProperty('key', key));
          resultEntry['rating'][value] += 1;
        }
      });
    });

    _.forEach(keys, function(key){
      var resultEntry = _.find(result, _.matchesProperty('key', key));
      resultEntry['stats']['count'] = store[key].length;
      resultEntry['stats']['mean'] = jStat.mean(store[key]).toFixed(3);
      resultEntry['stats']['median'] = jStat.median(store[key]);
      resultEntry['stats']['stdDev'] = jStat.stdev(store[key]).toFixed(3);
    });

    return result;
  }

  this.smashData = function(rawData, keys){
    return smashDataWorker(rawData, keys);
  }

  this.smashCompareData = function(rawData, key, category){
    var result = []; //put the resulting {} into this array
    if(category == 'Year'){ //year
      //filter the rawData into each year
      var years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad'];
      _.forEach(years, function(year){
        var filtData = filterData.byYear(rawData, year); //get filtered data;
        var res = smashDataWorker(filtData, [key]); //returns array of obj; obj=1 row
        res[0]['name'] = year;
        result.push(res[0]);
      })
      return result
    }
    else if(category == 'Course'){ //course
      var courses = ['Course 1', 'Course 2', 'Course 3','Course 4','Course 5','Course 6','Course 7','Course 8','Course 9','Course 10','Course 11','Course 12','Course 14','Course 15','Course 16','Course 17','Course 18','Course 20','Course 21','Course 22','Course 24'];
      _.forEach(courses, function(course){
        var filtData = filterData.byCourse(rawData, course); //get filtered data;
        var res = smashDataWorker(filtData, [key]); //returns array of obj; obj=1 row
        res[0]['name'] = course;
        result.push(res[0]);
      });
      return result
    }
    else{//residence
      var livingGroups = ['Ashdown House', 'Baker House', 'Burton-Conner House', 'East Campus', 'MacGregor House', 'Maseeh', 'McCormick House', 'New House', 'Next House', 'Random Hall', 'Senior Haus', 'Simmons Hall', 'FSILGs']
      var result;
      //init store
      var store = {};
      _.forEach(livingGroups, function(group){
        store[group] = [];
      });

      //filter into groups
      _.forEach(rawData, function(entry){
        if(entry.living_group == null){
          return; //skip
        }
        else if(store[entry.living_group]){//if its exists, add it to that array
          store[entry.living_group].push(entry);
        }
        else{
          //add it to FSILGs
          store['FSILGs'].push(entry);
        }
      });

      _.forEach(livingGroups, function(group){
        var res = smashDataWorker(store[group], [key]); //returns array of obj; obj=1 row
        res[0]['name'] = group;
        result.push(res[0]);
      });
      return result
    }
  }
})
.service('filterData', function(){
  this.byYear = function(rawData, year){
    var filtered = _.filter(rawData, {'year': year});
    return filtered;
  }

  this.byCourse = function(rawData, course){
    var filtered = _.filter(rawData, {'course': course});
    return filtered;
  }
})
.service('initObj', function(){
  //Takes array of keys & creates initial objects
  this.initArray = function(keys){
    var result = [];
    var obj = {
        'rating': {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0
        },
        'name': '',
        'key': '',
        'stats':{
          'count':0,
          'mean':0,
          'median':0,
          'stdDev':0
          }
    }
    _.forEach(keys, function(key){
      var clone = _.cloneDeep(obj);
      clone.key = key; //insert key
      clone.name = questionHash[key];
      result.push(clone);
    });
    return result;
  }
})
.directive('likertViz', [function(){
  function link(scope, element, attrs){
    var data;

    function updateChart(){
      console.log('#'+element[0].id, ' This is the updateChart Data: ', data);
      $('#'+element[0].id).empty();
      d3Likert('#'+element[0].id, data, {height: attrs.height, width: attrs.width})
    }

    scope.$watch(attrs.likertViz, function(value){
      data = value; //update the stored value
      updateChart(); //render chart
    });
  }
  return {
    link: link
  };
}])
.controller('mainController', function($scope, dataSmashingService, filters){
  $scope.options = filters.options;
  $scope.category = '';
  $scope.activeQuestion = '';
  $scope.view = true;
  $scope.prefroshData = dataSmashingService.smashData(data, ['self_prefrosh_enjoyed', 'self_prefrosh_picture', 'self_prefrosh_decide']);
  $scope.overallData = dataSmashingService.smashData(data, ['academics_assignments', 'academics_exams', 'rep_groups', 'rep_my_groups', 'rep_other_groups', 'rep_groups_more', 'rep_my_living_groups','rep_other_living_groups','rep_living_groups_hosting','community', 'stress', 'interact', 'occurs_more', 'reminds', 'help_out', 'hosting_prefrosh', 'prefrosh_learn', 'share_exp', 'prefrosh_accurate', 'enjoy_cpw']);
  $scope.filterData = [];

  var qs = _.values(questionHash);
  qs.unshift('')
  _.remove(qs, function(question){
    return question == "Did you attend CPW when you were a prefrosh?" || question == "How much sleep, if any, did you lose during CPW?";
  })
  $scope.allQuestions = qs;

  $scope.updateCompare = function(){
    //rawData, key, category
    if($scope.activeQuestion === '' || $scope.category === ''){
      console.log('passing b/c no params passed');
      return;
    }
    else{
      console.log('ready to pass on!');
      // $scope.filterData = dataSmashingService.smashCompareData(data, invertHash[$scope.activeQuestion], 'Residence');
      $scope.filterData = dataSmashingService.smashCompareData(data, invertHash[$scope.activeQuestion], $scope.category);
    }
  }
  $scope.toOverall = function(){
    $scope.view = true;
    $('#compA').removeClass('active');
    $('#overallA').addClass('active');
  }
  $scope.toComp = function(){
    $scope.view = false;
    $('#overallA').removeClass('active');
    $('#compA').addClass('active');
  }
})
