console.log(data);

var cpwViz = angular.module('cpwViz', ['angularCharts'])
.value('filters', {
  'options': ['Year','Course', 'Residence']
})
.service('dataSmashingService', function(initObj){
  // TODO: Smash the data together in the correct format
  this.smashData = function(rawData, keys){
    var result = initObj.initArray(keys);
    _.forEach(rawData, function(entry){
      _.forEach(keys, function(key){
        var value = entry[key];
        if(_.isFinite(value)){
          var resultEntry = _.find(result, _.matchesProperty('key', key));
          resultEntry['rating'][value] += 1;
        }
      });
    });
    console.log(result);
    return result;
  }
})
.service('filterData', function(){
  this.filter = function(rawData, category){
    if(category === ''){//case if there is no category
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
    var count = 0;
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
        'key': ''
    }
    _.forEach(keys, function(key){
      var clone = _.cloneDeep(obj);
      clone.key = key; //insert key
      clone.name = questionHash[key];
      result.push(clone);
      count += 1;
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
.controller('mainController', function($scope, dataSmashingService, filterData){
  $scope.category = 'bleeeeep';

  $scope.prefroshData = dataSmashingService.smashData(data, ['self_prefrosh_enjoyed', 'self_prefrosh_picture', 'self_prefrosh_decide']);
  $scope.overallData = dataSmashingService.smashData(data, ['academics_assignments', 'academics_exams', 'rep_groups', 'rep_my_groups', 'rep_other_groups', 'rep_groups_more', 'rep_my_living_groups','rep_other_living_groups','rep_living_groups_hosting','community', 'stress', 'interact', 'occurs_more', 'reminds', 'help_out', 'hosting_prefrosh', 'prefrosh_learn', 'share_exp', 'prefrosh_accurate', 'enjoy_cpw']);
})
