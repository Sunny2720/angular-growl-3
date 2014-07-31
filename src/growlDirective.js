angular.module("angular-growl").directive("growl", ["$rootScope", "$sce",
    function ($rootScope, $sce) {
        "use strict";

        return {
            restrict: 'A',
            templateUrl: 'templates/growl/growl.html',
            replace: false,
            scope: {
                reference: '@',
                inline: '@'
            },
            controller: ['$scope', '$timeout', 'growl',
                function ($scope, $timeout, growl) {
                    var onlyUnique = growl.onlyUnique();
                    $scope.messages = [];
                    var referenceId = $scope.reference || 0;
                    $scope.inlineMessage = $scope.inline || growl.inlineMessages();

                    function addMessage(message) {
                        $timeout(function () {
                            message.text = $sce.trustAsHtml(String(message.text));

                            /** ability to reverse order (newest first ) **/
                            if (growl.reverseOrder()) {
                                $scope.messages.unshift(message);
                            } else {
                                $scope.messages.push(message);
                            }

                            if (message.ttl && message.ttl !== -1) {
                                $timeout(function () {
                                    $scope.deleteMessage(message);
                                }, message.ttl);
                            }
                        }, true);
                    }

                    $rootScope.$on("growlMessage", function (event, message) {
                        var found;
                        var msgText;
                        if (parseInt(referenceId, 10) === parseInt(message.referenceId, 10)) {
                            if (onlyUnique) {
                                angular.forEach($scope.messages, function (msg) {
                                    msgText = $sce.getTrustedHtml(msg.text);
                                    if (message.text === msgText && message.title === msg.title) {
                                        found = true;
                                    }
                                });

                                if (!found) {
                                    addMessage(message);
                                }
                            } else {
                                addMessage(message);
                            }
                        }
                    });

                    $scope.deleteMessage = function (message) {
                        var index = $scope.messages.indexOf(message);
                        if (index > -1) {
                            $scope.messages.splice(index, 1);
                        }
                    };

                    $scope.alertClasses = function (message) {
                        return {
                            'icon': message.disableIcons === false
                        };
                    };

                    $scope.wrapperClasses = function () {
                        var classes = {};
                        classes['growl-fixed'] = !$scope.inlineMessage;
                        classes[growl.position()] = true;
                        return classes;
                    };
                }
            ]
        };
    }
]);
