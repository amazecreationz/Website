application.directive("imageLoad", [function() {
    return {
        restrict: "A",
        scope: {
            location: '=',
            image: '='
        },
        link: function(scope, elements, attributes) {
            scope.$watch('image', function(image){
                var location = scope.location ? 'https://static.amazecreationz.in' + scope.location : '';
                var parent = $(elements[0]);
                var imgLoaded = false;
                if(location && !imgLoaded) {
                    var thumbs = new Image();
                    thumbs.src = location+'thumbs/'+image;
                    thumbs.onload = function() {
                        if(!imgLoaded) {
                            parent.css({'background-image':'url('+thumbs.src+')'});
                        }
                    }
                }
                var img = new Image();
                img.src = location+image;
                img.onload = function() {
                    imgLoaded = true;
                    parent.css({'background-image':'url('+img.src+')'});
                } 
            })
            
        }
    }
}]);

application.directive("fileSelect", [function () {
    return {
        scope: {
            onFileSelect: '=',
            selectedFile: '=',
            label: '=',
            hideName: '@',
            accept: '@'
        },
        template: '<md-button class="md-raised" ng-click="selectFile()">{{label}}</md-button><input id="file-select-input" type="file" name="file-select-input" accept="{{accept}}" style="display: none;"/><span ng-hide="hideName" class="pad10 text-16">{{selectedFile.name}}</span>',
        link: function (scope, elements, attributes) {
            var fileInput = $(elements[0]).find('#file-select-input');
            scope.label = scope.label || 'Choose File';

            
            fileInput.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.selectedFile = changeEvent.target.files[0];
                    scope.onFileSelect(scope.selectedFile);
                });
            });

            scope.selectFile = function() {
                fileInput.trigger('click');
            }
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
        template: '<div ng-if="loader" class="mrg20" layout="row" layout-align="space-around"><md-progress-circular class="md-primary" md-diameter="40"></md-progress-circular></div>',
        link: function(scope, elements, attributes) {}
    }
}]);

application.directive("pageHeader", [function() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            theme: '=',
            backButton: '=',
            header: '@',
            tabs: '=',
            currentTab: '=',
            onTabSelect: '=',
            menuItems: '=',
            menuFunction: '='
        },
        //templateUrl: application.globals.html.templates + 'page-header.html',
        template: '<div class="page-header" ng-class="\'bg-theme-\'+theme"><div class="title" layout="row" layout-align="start center"><md-icon ng-if="backButton" class="material-icons text-size-d back" md-ink-ripple ng-click="goBack()">arrow_back</md-icon><div class="text-size-d" flex>{{header}}</div><div class="menu-container"></div></div><div ng-if="tabs |isEmpty : true" class="tabs"><div class="tab-item text-no-select" ng-repeat="tab in tabs" ng-class="{\'active\': currentTab==tab.id}" ng-click="changeTab(tab)">{{tab.name}}</div></div></div>',
        link: function(scope, elements, attributes) {
            if(scope.tabs && !scope.currentTab) {
                scope.currentTab = scope.tabs[0].id;
            }

            scope.goBack = function() {
                history.back();
            }
            
            scope.changeTab = function(tab) {
                scope.currentTab = tab.id;
                if(scope.onTabSelect) {
                    scope.onTabSelect(tab);
                }
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
            var emptyDiv = '<div></div>'
            var loginMessageHtml = '<span>You have to <span class="text-bold pointer" ng-click="showLogin()">login</span> to view this content.</span>'
            var permissionsMessageHtml = '<span>You don\'t have sufficient permissions to view this content. Contact Administrator.</span>'
            
            $(emptyDiv).insertAfter(body);
            var messageDiv = body.next();

            scope.showLogin = function(){
                AppService.customLogin();
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
            
            scope.$watch('list', function(list) {
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

application.directive("overviewCalendar", [function() {
    return {
        restrict: "E",
        scope: {
            minDate: '=',
            maxDate: '=',
            selectedDate: '=',
            onDateSelect: '=',
            barsData: '=',
            theme: '='
        },
        templateUrl: application.globals.html.templates + 'overview-calendar.html',
        link: function(scope, elements, attributes) {
            scope.months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            scope.days = ["S", "M", "T", "W", "T", "F", "S"];

            var getDateFromDay = function(day) {
                return new Date(scope.selectedYear, scope.selectedMonth, day).getTime();
            }            

            var setMonthDates = function(month, year) {
                var startWeekDay = new Date(year, month, 1).getDay(),
                    lastDay =  new Date(year, month+1, 0).getDate();//month+1 gives proper result.

                scope.monthDates = Array(startWeekDay).fill(0);
                scope.validDates = [];

                for(var i=0; i<lastDay; i++) {
                    scope.monthDates.push(i+1);
                    scope.validDates.push(scope.isRange(i+1));
                }

                var zeroPad = 7 - scope.monthDates.length % 7;
                while(zeroPad>0) {
                    scope.monthDates.push(0);
                    zeroPad--;
                }
            }

            scope.onDatePickerChange = function(month, year) {
                var lastDay =  new Date(year, month+1, 0).getDate(),//month+1 gives proper result.
                    date = 1;

                while(!scope.isRange(date) && date <= lastDay+1) {
                    date ++;
                }
                scope.selectedDate = date <= lastDay ? new Date(year, month, date).getTime() : undefined;
            }

            scope.onDaySelect = function(day) {
                var date = getDateFromDay(day);
                scope.selectedDate = date;    
            }

            scope.isSelectedDate = function(day) {
                return scope.selectedDate == getDateFromDay(day);
            }

            

            scope.$watchGroup(['minDate', 'maxDate'], function(values) {
                var minDate = values[0],
                    maxDate = values[1],
                    minMonth = 0,
                    maxMonth = 12;

                if(angular.isDefined(minDate)) {
                    minMonth = new Date(minDate).getMonth();
                }

                if(angular.isDefined(maxDate)) {
                    maxMonth = new Date(maxDate).getMonth();
                }

                scope.isValidMonth = function(month) {
                    month = scope.months.indexOf(month);
                    return (month >= minMonth) && (month <= maxMonth);
                }

                scope.isRange = function(day) {
                    if(day == 0) {
                        return false;
                    }
                    var date = getDateFromDay(day);
                    var result = true;
                    result = result && (angular.isDefined(minDate) ? date >= minDate : true);
                    result = result && (angular.isDefined(maxDate) ? date <= maxDate : true);
                    return result;
                }

            })

            scope.$watch('selectedDate', function(sD) {
                if(angular.isDefined(sD)) {
                    scope.onDateSelect(sD);
                    sD = new Date(sD);
                    scope.selectedMonth = sD.getMonth();
                    scope.selectedYear = sD.getFullYear();
                    setMonthDates(scope.selectedMonth, scope.selectedYear);
                }   
            }) 
        }
    }
}])

application.directive("user", ['FirebaseService', function(FirebaseService) {
    return {
        restrict: "E",
        scope: {
            info: '=',
            userId: '=',
            onClick: '=',
            theme: '='
        },
        templateUrl: application.globals.html.templates + 'user.html',
        link: function(scope, elements, attributes) {
            if(scope.info) {
                scope.userData = scope.info;
            }
            else if(scope.userId) {
                FirebaseService.getUserInfo(scope.userId, function(info) {
                    scope.userData = info;
                });
            }
        }
    }
}]);

application.directive("teamMember", ['AppService', function(AppService) {
    return {
        restrict: "E",
        scope: {
            info: '=',
            onClick: '=',
            theme: '='
        },
        template: '<div ng-click="onTeamSelect(info)" style="padding: 10px 15px; cursor: pointer;" ng-class="{\'bg-light\': hover}" layout="row" layout-align="start center" ng-init="hover=false" ng-mouseenter="hover=true" ng-mouseleave="hover=false"><div style="width: 50px; height: 50px; background-size: 50px; border-radius: 50%; margin-right: 10px;" ng-class="\'bg-light-theme-\'+\'{{theme}}\'" image-load image="info.pURL"></div><div style="padding: 0 10px;" ><div style="font-size: 20px;">{{info.n}}</div><div style="margin-top: -5px; font-size: 14px;">{{info.e}}</div></div></div>',
        link: function(scope, elements, attributes) {
            scope.onTeamSelect = function(info) {
                AppService.viewProfile(info.profileURL);
            }

            if (angular.isDefined(scope.onClick)) {
                scope.onTeamSelect = scope.onClick;
            }
        }
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
        template: "<div layout='row'><div ng-repeat=\"tag in tagData | orderBy : 'priority' : true\" ng-class=\"'text-no-select bg-theme-'+tag.theme\" style='padding: 5px 10px; margin-right: 10px;'>{{tag.title}}</div></div>",
        link: function (scope, elements, attributes) {}
    }
}]);




/*
widget: Get from Play Store
link: playstore link
height: (optional) height of image - default height: 30px
*/
application.directive('googlePlay', [function() {
    return {
        restrict:'E',
        replace: true,
        scope: {
            link: '@',
            height: '@'
        },
        template: '<a href="{{link}}" target="_blank"><img alt="Get it on Google Play" ng-style="imgClass" src="https://static.amazecreationz.in/images/google-play-badge.png"/></a>',
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

application.directive('chart', ['$state', function($state) {
    return {
        restrict:'E',
        scope: {
            chartData: '=',
            chartLoaded: '=',
            chartObject: '=?'
        },
        replace: true,
        template: '<canvas class="chart-container"></canvas>',
        link: function (scope, elements, attributes) {
            var chartLoaded;
            var chartData;
            var chartElement = elements[0].getContext('2d');
            scope.chartObject = null;
            scope.$watchGroup(['chartLoaded', 'chartData'], function(values) {
                chartLoaded = values[0];
                chartData = values[1];
                if(chartLoaded && chartData) {
                    if(scope.chartObject != null) {
                        scope.chartObject.destroy();
                    }
                    scope.chartObject = new Chart(chartElement, chartData);
                }             
            })
        }
    }
}]);

application.directive('lineMessage', [function() {
    return {
        restrict:'E',
        scope: {
            type: '@',
            message: '@',
            actionFunction: '=',
            actionMessage: '@'
        },
        template: '<div ng-show="message" class="card line-message text-no-select" ng-class="\'bg-light-theme-\'+types[type].theme" layout="row" layout-align="start center"><md-icon class="material-icons text-size-d">{{types[type].icon}}</md-icon><div class="right" layout-xs="column" layout-gt-xs="row" flex><div class="message" ng-bind-html="message" flex></div><div class="action" ng-if="actionFunction" ng-click="actionFunction()">{{actionMessage}}</div></div></div',
        link: function (scope, elements, attributes) {
            scope.types = {"error":{"icon":"error","theme":"red"},"warning":{"icon":"warning","theme":"orange"},"info":{"icon":"info","theme":"teal"},"help":{"icon":"help","theme":"blue"}};
        }
    }
}]);

application.directive('help', [function() {
    return {
        restrict:'E',
        scope: {
            message: '='
        },
        template: '<div ng-show="message" class="padtb10" layout="row" layout-align="start center"><md-icon class="material-icons mrg0 text-size-e mrgrt10 text-theme-blue">help</md-icon><div class="text-16 text-theme-grey" ng-bind="message"></div></div>',
        link: function (scope, elements, attributes) { }
    }
}]);

