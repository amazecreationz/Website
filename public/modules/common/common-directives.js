amazecreationz.directive("bgLoad", [function() {
    return {
        restrict: "A",
        scope: {
            image: '='
        },
        link: function(scope, elements, attributes) {
            scope.$watch('image', function(image){
                var img_url = angular.isDefined(attributes.url) ? attributes.url+image : amazecreationz.globals.image.root_url+image;
                var img = new Image();
                img.src = img_url;
                img.onload = function() {
                  $(elements[0]).css({'background-image':'url('+img.src+')'});
                } 
            })
            
        }
    }
}]);

 amazecreationz.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, elements, attributes) {
            var modelSetter = $parse(attributes.fileModel).assign;
          
            elements.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, elements[0].files[0]);
                });
            });
        }
    };
 }]);