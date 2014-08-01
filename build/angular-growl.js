/**
 * angular-growl-v3 - v0.1.2 - 2014-08-01
 * http://asimon-option.github.io/angular-growl-3
 * Copyright (c) 2014 Alberto Simón; Licensed MIT
 */
angular.module('angular-growl', []).run([
  '$templateCache',
  function ($templateCache) {
    'use strict';
    $templateCache.put('templates/growl/growl.html', '<div class="growl-container" ng-class="wrapperClasses()">' + '<div class="growl-item alert" ng-repeat="message in messages" ng-class="alertClasses(message)">' + '<button type="button" ng-class="message.button.class" data-dismiss="alert" aria-hidden="true" ng-click="deleteMessage(message); message.button.callback();" ng-show="message.button">{{ message.button.value }}</button>' + '<h4 class="growl-title" ng-show="message.title" ng-bind="message.title"></h4>' + '<div class="growl-message" ng-bind-html="message.text"></div>' + '</div>' + '</div>');
  }
]);
;
angular.module('angular-growl').directive('growl', [
  '$rootScope',
  '$sce',
  function ($rootScope, $sce) {
    'use strict';
    return {
      restrict: 'A',
      templateUrl: 'templates/growl/growl.html',
      replace: false,
      scope: {
        reference: '@',
        inline: '@'
      },
      controller: [
        '$scope',
        '$timeout',
        'growl',
        function ($scope, $timeout, growl) {
          var onlyUnique = growl.onlyUnique();
          $scope.messages = [];
          var referenceId = $scope.reference || 0;
          $scope.inlineMessage = $scope.inline || growl.inlineMessages();
          function addMessage(message) {
            $timeout(function () {
              message.text = $sce.trustAsHtml(String(message.text));
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
          $rootScope.$on('growlMessage', function (event, message) {
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
            return { 'icon': message.disableIcons === false };
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
angular.module('angular-growl').provider('growl', function () {
  'use strict';
  var _ttl = null, _onlyUniqueMessages = true, _referenceId = 0, _inline = false, _position = 'top-right', _disableIcons = false, _reverseOrder = false;
  this.globalTimeToLive = function (ttl) {
    _ttl = ttl;
  };
  this.globalDisableIcons = function (disableIcons) {
    _disableIcons = disableIcons;
  };
  this.globalReversedOrder = function (reverseOrder) {
    _reverseOrder = reverseOrder;
  };
  this.globalInlineMessages = function (inline) {
    _inline = inline;
  };
  this.globalPosition = function (position) {
    _position = position;
  };
  this.onlyUniqueMessages = function (onlyUniqueMessages) {
    _onlyUniqueMessages = onlyUniqueMessages;
  };
  this.$get = [
    '$rootScope',
    '$interpolate',
    '$filter',
    function ($rootScope, $interpolate, $filter) {
      var translate;
      try {
        translate = $filter('translate');
      } catch (e) {
      }
      function broadcastMessage(message) {
        if (translate) {
          message.text = translate(message.text, message.variables);
        } else {
          var polation = $interpolate(message.text);
          message.text = polation(message.variables);
        }
        $rootScope.$broadcast('growlMessage', message);
      }
      function sendMessage(text, config) {
        var _config = config || {}, message;
        message = {
          text: text,
          title: _config.title,
          ttl: _config.ttl || _ttl,
          variables: _config.variables || {},
          disableIcons: _config.disableIcons === undefined ? _disableIcons : _config.disableIcons,
          button: _config.button !== undefined ? _config.button : null,
          position: _config.position || _position,
          referenceId: _config.referenceId || _referenceId
        };
        broadcastMessage(message);
      }
      function onlyUnique() {
        return _onlyUniqueMessages;
      }
      function reverseOrder() {
        return _reverseOrder;
      }
      function inlineMessages() {
        return _inline;
      }
      function position() {
        return _position;
      }
      return {
        sendMessage: sendMessage,
        onlyUnique: onlyUnique,
        reverseOrder: reverseOrder,
        inlineMessages: inlineMessages,
        position: position
      };
    }
  ];
});