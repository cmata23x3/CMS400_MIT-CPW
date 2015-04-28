console.log(data);

var cpwViz = angular.module('cpwViz', ['angularCharts'])
.value('filters', {
  'options': ['Year','Course', 'Residence']
})
.service('dataSmashingService', function(initObj){
  // TODO: Smash the data together in the correct format
  this.smashPrefroshData = function(rawData){
    console.log('smashing data');
    var keyArr = ['self_prefrosh_enjoyed', 'self_prefrosh_picture', 'self_prefrosh_decide'];
    var result = initObj.initArray(keyArr);
    _.forEach(rawData, function(entry){
      _.forEach(keyArr, function(key){
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
  this.smashOverallData = function(){

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
      clone.name = count;
      result.push(clone);
      count += 1;
    });
    return result;
  }
})
.directive('likertViz', [function(){
  function link(scope, element, attrs){
    var data;
    var likertData = [
        {
            "rating": {
                1: 184,
                2: 63,
                3: 32,
                4: 39,
                5: 28,
                6: 17,
                7: 19
            },
            "name": "A first item to rate"
        },
        {
            "rating": {
                "1": "32",
                "2": "35",
                "3": "36",
                "4": "70",
                "5": "68",
                "6": "83",
                "7": "61"
            },
            "name": "A second item to rate"
        }
    ];

    function updateChart(){
      // element.text(data);
      console.log('data changed!!!');
      console.log('This is the updateChart Data: ', data);
      d3Likert('#'+element[0].id, data, {height: attrs.height, width: attrs.width})
      // d3Likert('#'+element[0].id, likertData, {height: 740, width: 1000 });
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
  $scope.data = data; //store the data
  $scope.category = 'bleeeeep';

  $scope.prefroshData = dataSmashingService.smashPrefroshData(data);
  // $scope.renderData = dataSmashingService.smash(filterData.filter($scope.data, category));
})
