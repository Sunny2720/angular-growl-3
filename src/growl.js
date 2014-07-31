angular
    .module('angular-growl', [])
    .run(['$templateCache', function ($templateCache) {
        "use strict";
        $templateCache.put("templates/growl/growl.html",
            '<div class="growl-container" ng-class="wrapperClasses()">' +
                '<div class="growl-item alert" ng-repeat="message in messages" ng-class="alertClasses(message)">' +
                    '<button type="button" ng-class="message.button.class" data-dismiss="alert" aria-hidden="true" ng-click="deleteMessage(message); message.button.callback();" ng-show="message.button">{{ message.button.value }}</button>' +
                    '<h4 class="growl-title" ng-show="message.title" ng-bind="message.title"></h4>' +
                    '<div class="growl-message" ng-bind-html="message.text"></div>' +
                '</div>' +
            '</div>'
        );
    }])
;