application.directive("imageLoad", [function() {
    return {
        restrict: "A",
        scope: {
            location: '=',
            image: '='
        },
        link: function(scope, elements, attributes) {
            scope.$watch('image', function(image){
                var location = scope.location ? scope.location : '';
                var img_url = location+image;
                var img = new Image();
                img.src = img_url;
                img.onload = function() {
                  $(elements[0]).css({'background-image':'url('+img.src+')'});
                } 
            })
            
        }
    }
}]);

application.directive("pageScroll", [function() {
    return {
        restrict: "E",
        scope: {
            container: '=',
            animationTime: '='
        },
        link: function(scope, elements, attributes) {
            var containerElement = $(scope.container);
            var animationTime = scope.animationTime || 1000;
            var containerOffset = containerElement.position().top;
            var containerHeight = $(window).height() - containerOffset;
            var parentId = elements.attr('id') || 'page-scroll';
            var children = elements.children();
            var scrollTop = containerElement.scrollTop();
            var isScrolling = false;

            var getChildId = function(position) {
                return parentId +'-child-'+ position;
            }

            angular.forEach(children, function(child, index) {
                $(child).addClass('full-height');
                $(child).attr('id', getChildId(index));
            });

            var scrollTo = function(value) {
                isScrolling = true;
                containerElement.animate({
                    scrollTop: value
                }, animationTime, function() {
                    isScrolling = false;
                });
            }

            containerElement.scroll(function() {
                if(isScrolling) {
                    return;
                }
                var newScrollTop = containerElement.scrollTop();
                if(newScrollTop > scrollTop - 5 && newScrollTop < scrollTop + 5) {
                    return;
                }
                else if(newScrollTop > scrollTop) {
                    scrollTop += containerHeight;
                }
                else {
                    scrollTop -= containerHeight;
                }
                scrollTo(scrollTop);
            });

            $(window).resize(function() {
                containerOffset = containerElement.position().top;
                containerHeight = $(window).height() - containerOffset;
                scrollTop = Math.floor(scrollTop / containerHeight)  * containerHeight;
            })
        }
    }
}]);

application.directive("loader", ['$compile', function($compile) {
    return {
        restrict: "E",
        scope: {
            loader: '=',
        },
        template: '<div ng-if="loader" class="mrg20" layout="row" layout-align="space-around"><md-progress-circular class="md-primary" md-diameter="40"></md-progress-circular></div',
        link: function(scope, elements, attributes) {}
    }
}]);

application.directive("pageHeader", [function() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            theme: '=',
            header: '@',
            tabs: '=',
            currentTab: '=',
            onTabSelect: '=',
            buttonLabel: '@',
            buttonClick: '=',
            menuItems: '=',
            menuFunction: '='
        },
        templateUrl: application.globals.html.templates + 'page-header.html',
        link: function(scope, elements, attributes) {
            if(scope.tabs && !scope.currentTab) {
                scope.currentTab = scope.tabs[0].id;
            }
            
            scope.changeTab = function(tab) {
                scope.currentTab = tab.id;
                scope.onTabSelect(tab);
            }
        }  
    }
}]);

application.directive("permissionCheck", ['$compile', 'AppService', function($compile, AppService) {
    return {
        restrict: "A",
        scope: {
            permissionCheck: '=',
            minPermission: '='
        },
        link: function(scope, elements, attributes) {
            var body = $(elements);
            var permissions = angular.copy(application.permissions);
            var minPermission = scope.minPermission;
            var bodyHtml = body.html();
            var emptyDiv = '<div class="padtb15"></div>'
            var loginMessageHtml = '<span>You have to <span class="text-bold pointer" ng-click="showLogin()">login</span> to view this content.</span>'
            var permissionsMessageHtml = '<span>You don\'t have sufficient permissions to view this content. Contact Administrator.</span>'
            
            $(emptyDiv).insertAfter(body);
            var messageDiv = body.next();

            scope.showLogin = function(){
                AppService.showLogin();
            }

            scope.$watch('permissionCheck', function(permissionCheck){
                messageDiv.removeClass('hide');
                body.addClass('hide');

                var bodyContentHtml;
                
                if(permissionCheck == permissions.VISITOR && permissionCheck > minPermission) {
                    bodyContentHtml = loginMessageHtml;
                } else if(permissionCheck > minPermission) {
                    bodyContentHtml = permissionsMessageHtml;
                }
                else {
                    bodyContentHtml = null;
                    messageDiv.addClass('hide');
                    body.removeClass('hide');
                }
                
                messageDiv.html($compile(bodyContentHtml)(scope));
            })
        }
    }
}]);


application.directive("listLoader", ['$compile', function($compile) {
    return {
        restrict: "E",
        scope: {
            list: '=',
            listParam: '@',
            message: '='
        },
        template: '<div class="hide"></div>',
        link: function(scope, elements, attributes) {
            var messageHtml;
            var loaderHtml = '<loader flex="100" loader="showLoader"></loader>'
            var body = $(elements[0]);

            $($compile(loaderHtml)(scope)).insertAfter(body);
            scope.showLoader = true;

            if(scope.message){
                messageHtml = scope.message;
            } else {
                messageHtml = 'No '+scope.listParam+' Found.'
            }
            body.html(messageHtml)
            
            scope.$watch('list', function(list){
                if(angular.isUndefined(list)) {
                    scope.showLoader = true;
                    body.addClass('hide')
                } 
                else if(_.isEmpty(list)) {
                    scope.showLoader = false;
                    body.removeClass('hide');
                }
                else {
                    scope.showLoader = false;
                    body.addClass('hide')
                }
            })
            
        }
    }
}]);

application.directive("appCard", ['AppService', function(AppService) {
    return {
        restrict: "E",
        scope: {
            appInfo: '=',
            index: '='
        },
        templateUrl: application.globals.html.templates + 'app-card.html',
        link: function(scope, elements, attributes) {
            scope.index += 1;
            var element = elements[0];
            if(scope.index % 3 == 0) {
                $(element).addClass('third');
            }
            else if(scope.index % 3 == 1) {
                $(element).addClass('first');
            }

            scope.goToApplicationPage = function() {
                AppService.goToApplicationPage(scope.appInfo.id);
            }
        }
    }
}]);

application.directive("user", ['FirebaseService', function(FirebaseService) {
    return {
        restrict: "E",
        scope: {
            userInfo: '=',
            userId: '=',
            onClick: '='
        },
        templateUrl: application.globals.html.templates + 'user.html',
        link: function(scope, elements, attributes) {
            if(scope.userInfo) {
                scope.userData = scope.userInfo;
            }
            else if(scope.userId) {
                FirebaseService.getUserInfo(scope.userId, function(userInfo) {
                    scope.userData = userInfo;
                });
            }
        }
    }
}]);

application.directive("crew", ['FirebaseService', function(FirebaseService) {
    return {
        restrict: "E",
        scope: {
            crewInfo: '=',
            crewUrl: '=',
            isSmall: '=',
            onClick: '='
        },
        templateUrl: application.globals.html.templates + 'crew.html',
        link: function(scope, elements, attributes) {
            if(angular.isDefined(scope.crewUrl)) {
                FirebaseService.getCrewInfoFromURL(scope.crewUrl, function(crewInfo) {
                    scope.crewInfo = crewInfo;
                    _.defer(function(){scope.$apply();});
                })
            }
        }
    }
}]);

application.directive("contributor", ['AppService', function(AppService) {
    return {
        restrict: "E",
        scope: {
            crewInfo: '=',
            onClick: '='
        },
        templateUrl: application.globals.html.templates + 'contributor.html',
        link: function(scope, elements, attributes) {}
    }
}]);

application.directive("gitCommit", ['AppService', function(AppService) {
    return {
        restrict: "E",
        scope: {
            commitInfo: '='
        },
        templateUrl: application.globals.html.templates + 'git-commit.html',
        link: function(scope, elements, attributes) {
            scope.dateFormat = angular.copy(application.globals.dateFormat);
            scope.viewCommit = function() {
                AppService.openURLinNewTab(scope.commitInfo.url);
            }
        }
    }
}]);

/*
widget: Tags
tagdata: Tags Info Object
*/
application.directive('tags', ['$state', function($state) {
    return {
        restrict:'E',
        scope: {
            tagData: '='
        },
        template: "<span ng-repeat=\"tag in tagData | orderBy : 'priority' : true\" style='background-color: {{tag.color}}; padding: 5px 10px; margin: 0 5px; color: #FFF'>{{tag.title}}</span>",
        link: function (scope, elements, attributes) {}
    }
}]);




/*
widget: Get from Play Store
link: playstore link
height: (optional) height of image - default height: 30px
*/
application.directive('googlePlay', ['$state', function($state) {
    return {
        restrict:'E',
        scope: {
            link: '@',
            height: '@'
        },
        template: '<a href="{{link}}" target="_blank"><img alt="Get it on Google Play" ng-style="imgClass" src="/resources/images/google-play-badge.png"/></a>',
        link: function (scope, elements, attributes) {
            if(angular.isUndefined(scope.height)){
                scope.imgClass={
                    'height': '30px',
                    'width': 'auto'
                };
            }
            else {
                scope.imgClass={
                    'height': scope.height,
                    'width': 'auto'
                };
            }
        }
    }
}]);