angular.module("angular-growl").provider("growl", function() {
  "use strict";

  var _ttl = null,
      _onlyUniqueMessages = true,
      _referenceId = 0,
      _inline = false,
      _position = 'top-right',
      _disableIcons = false,
      _reverseOrder = false;

  /**
   * set a global timeout (time to live) after which messages will be automatically closed
   *
   * @param ttl in seconds
   */
  this.globalTimeToLive = function(ttl) {
    _ttl = ttl;
  };

  /**
   * set whether the icons will be shown in the message
   *
   * @param {bool} messageIcons
   */
  this.globalDisableIcons = function (disableIcons) {
    _disableIcons = disableIcons;
  };

  /**
   * set whether message ordering is reversed
   *
   * @param {bool} reverseOrder
   */
   this.globalReversedOrder = function (reverseOrder) {
    _reverseOrder = reverseOrder;
   };

  /**
   * set wheter the notficiation is displayed inline our in growl like fasion
   *
   * @param {bool} inline true to show only inline notifications
   */
  this.globalInlineMessages = function(inline) {
    _inline = inline;
  };

  /**
   * set position
   *
   * @param  {string} messageVariableKey default: top-right
   */
  this.globalPosition = function(position) {
    _position = position;
  };

  this.onlyUniqueMessages = function(onlyUniqueMessages) {
    _onlyUniqueMessages = onlyUniqueMessages;
  };

  this.$get = ["$rootScope", "$interpolate", "$filter", function ($rootScope, $interpolate, $filter) {
    var translate;

    try {
      translate = $filter("translate");
    } catch (e) {
      //
    }

    function broadcastMessage(message) {
      if (translate) {
        message.text = translate(message.text, message.variables);
      } else {
        var polation = $interpolate(message.text);
        message.text = polation(message.variables);
      }
      $rootScope.$broadcast("growlMessage", message);
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
      reverseOrder : reverseOrder,
      inlineMessages: inlineMessages,
      position: position
    };
  }];
});
