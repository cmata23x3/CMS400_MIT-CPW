var cpwViz = angular.module('cpwViz', ['angularCharts'])
.value('filters', {
  'options': ['', 'Year', 'Course', 'Residence']
})
.service('dataSmashingService', function(initObj){
  this.smashData = function(rawData, keys){
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
})
.service('filterData', function(){
  this.filter = function(rawData, category){
    if(category === 'All'){//case if there is no category
      return rawData
    }
    else{
      console.log('should filter')
      // TODO: Add the filter logic
      return rawData
    }
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
      console.log('data changed!!!');
      console.log('This is the updateChart Data: ', data);
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
.controller('mainController', function($scope, dataSmashingService, filterData, filters){
  $scope.options = filters.options;
  $scope.category = '';
  $scope.activeQuestion = '';
  $scope.view = true;

  $scope.prefroshData = dataSmashingService.smashData(data, ['self_prefrosh_enjoyed', 'self_prefrosh_picture', 'self_prefrosh_decide']);
  $scope.overallData = dataSmashingService.smashData(data, ['academics_assignments', 'academics_exams', 'rep_groups', 'rep_my_groups', 'rep_other_groups', 'rep_groups_more', 'rep_my_living_groups','rep_other_living_groups','rep_living_groups_hosting','community', 'stress', 'interact', 'occurs_more', 'reminds', 'help_out', 'hosting_prefrosh', 'prefrosh_learn', 'share_exp', 'prefrosh_accurate', 'enjoy_cpw']);

  var qs = _.values(questionHash);
  qs.unshift('')
  $scope.allQuestions = qs;

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
