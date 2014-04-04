//NOTE: alert() statements are available for debugging purposes. You can uncomment the statements to show dialogs when each method is hit.
(function ($) {
    //TODO: if necessary, add additional statements to initialize each part of the namespace before your BrowserMessagingSendControl is called. 
    if (typeof K2Field === 'undefined' || K2Field === null) K2Field = {};
    if (typeof K2Field.SmartForms === 'undefined' || K2Field.SmartForms === null) K2Field.SmartForms = {};
    if (typeof K2Field.SmartForms.BrowserMessaging === "undefined" || K2Field.SmartForms.BrowserMessaging == null) K2Field.SmartForms.BrowserMessaging = {};

    K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl = {

        //internal method used to get a handle on the control instance
        _getInstance: function (id) {
            //alert("_getInstance(" + id + ")");
            var control = jQuery('#' + id);
            if (control.length == 0) {
                throw 'BrowserMessagingSendControl \'' + id + '\' not found';
            } else {
                return control[0];
            }
        },

        getValue: function (objInfo) {
            //alert("getValue() for control " + objInfo.CurrentControlId);
            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._getInstance(objInfo.CurrentControlId);
            return instance.value;
        },

        getDefaultValue: function (objInfo) {
            //alert("getDefaultValue() for control " + objInfo.CurrentControlId);
            getValue(objInfo);
        },

        setValue: function (objInfo) {
            //alert("setValue() for control " + objInfo.CurrentControlId);
            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._getInstance(objInfo.CurrentControlId);

            // set value
            instance.value = objInfo.Value;

            // broadcast to parent only - at the moment
            K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._sendPostMessageToParent(objInfo);

            var oldValue = instance.value;
            //only change the value if it has actually changed, and then raise the OnChange event
            //if (oldValue != objInfo.Value) {
            //    instance.value = objInfo.Value;
            //    raiseEvent(objInfo.CurrentControlId, 'Control', 'OnChange');
            //}
        },

        //retrieve a property for the control
        getProperty: function (objInfo) {
            //alert("getProperty(" + objInfo.property + ") for control " + objInfo.CurrentControlId);
            if (objInfo.property.toLowerCase() == "value") {
                return K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl.getValue(objInfo);
            }
            else {
                return $('#' + objInfo.CurrentControlId).attr(objInfo.property);
            }
        },

        //set a property for the control. note case statement to call helper methods
        setProperty: function (objInfo) {
            switch (objInfo.property.toLowerCase()) {
                case "style":
                    K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl.setStyles(null, objInfo.Value, $('#' + objInfo.CurrentControlId));
                    break;
                case "value":
                    K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl.setValue(objInfo);
                    break;
                case "isvisible":
                    K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl.setIsVisible(objInfo);
                    break;
                case "isenabled":
                    K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl.setIsEnabled(objInfo);
                    break;
                default:
                    $('#' + objInfo.CurrentControlId).attr(objInfo.property, objInfo.Value);
            }
        },

        validate: function (objInfo) {
            //alert("validate for control " + objInfo.CurrentControlId);
        },

        //helper method to set visibility
        setIsVisible: function (objInfo) {
            //alert("set_isVisible: " + objInfo.Value);
            value = (objInfo.Value === true || objInfo.Value == 'true');
            this._isVisible = value;
            var displayValue = (value === false) ? "none" : "block";
            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._getInstance(objInfo.CurrentControlId);
            instance.style.display = displayValue;
        },

        //helper method to set control "enabled" state
        setIsEnabled: function (objInfo) {
            //alert("set_isEnabled: " + objInfo.Value);
            value = (objInfo.Value === true || objInfo.Value == 'true');
            this._isEnabled = value;
            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._getInstance(objInfo.CurrentControlId);
            instance.readOnly = !value;
        },

        setStyles: function (wrapper, styles, target) {
            var isRuntime = (wrapper == null);
            var options = {};
            var element = isRuntime ? jQuery(target) : wrapper.find('.K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl');

            jQuery.extend(options, {
                "border": element,
                "background": element,
                "margin": element,
                "padding": element,
                "font": element,
                "horizontalAlign": element
            });

            StyleHelper.setStyles(options, styles);
        },

        execute: function (objInfo) {
            //debugger;
            // The control id can be retrieved as follows
            var controlId = objInfo.CurrentControlID;
            // methodParameters is an object mapping the property names to their values
            var parameters = objInfo.methodParameters;

            var parameterNames = [];
            var method = objInfo.methodName;

            var pMessage = "";
            var pMessageId = "";
            var pMessageType = "";
            var pCallback = "";
            var pBroadcast = false;

            if (parameters.hasOwnProperty("message")) {
                pMessage = parameters["message"];                
            }

            if (parameters.hasOwnProperty("messagetype")) {
                pMessageType = parameters["messagetype"];
            }

            if (parameters.hasOwnProperty("messageid")) {
                pMessageId = parameters["messageid"];
            }

            if (parameters.hasOwnProperty("callback")) {
                pCallback = parameters["callback"];
            }

            if (parameters.hasOwnProperty("broadcast")) {
                pBroadcast = parameters["broadcast"];
            }

            var x = {
                'message': pMessage,
                'messageId': pMessageId,
                'messageType': pMessageType,
                'fromUrl': window.location.href,
                'broadcast': pBroadcast,
                'callback': pCallback,
                'messageDateTime': Date.now()
            };

            var data = JSON.stringify(x);
            switch (method) {
                case "sendmessagetoparent":
                    window.parent.postMessage(data, "*");
                    raiseEvent(objInfo.CurrentControlID, 'Control', 'OnMessageSent');
                    break;
                case "sendmessagetochildren":
                    var frames = $('iframe');
                    for (var i = 0; i < frames.length; i++) {
                        frames[i].contentWindow.postMessage(data, '*');
                    }
                    raiseEvent(objInfo.CurrentControlID, 'Control', 'OnMessageSent');
                    break;
                case "sendmessage":
                    window.parent.postMessage(JSON.stringify(x), "*");
                    var frames = $('iframe');
                    for (var i = 0; i < frames.length; i++) {
                        frames[i].contentWindow.postMessage(data, '*');
                    }
                    raiseEvent(objInfo.CurrentControlID, 'Control', 'OnMessageSent');
                    break;
            }
            console.log(x);
            return data;
        },

        _sendPostMessageToParent: function (objInfo) {

            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._getInstance(objInfo.CurrentControlId);
            //var props = jQuery.parseJSON($(instance).attr("data-options"));

            var x = {
                'message': $(instance).attr("value"),
                'messageId': $(instance).attr("messageid"),
                'messageType': $(instance).attr("messagetype"),
                'fromUrl': window.location.href,
                'broadcast': $(instance).attr("broadcast"),
                'callback': $(instance).attr("callback"),
                'messageDateTime': Date.now()
            };
            window.parent.postMessage(JSON.stringify(x), "*");

        },

        _sendPostMessageToChildren: function (objInfo) {

            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._getInstance(objInfo.CurrentControlId);
            //var props = jQuery.parseJSON($(instance).attr("data-options"));

            var x = {
                'message': $(instance).attr("value"),
                'messageId': $(instance).attr("messageid"),
                'messageType': $(instance).attr("messagetype"),
                'fromUrl': window.location.href,
                'broadcast': $(instance).attr("broadcast"),
                'callback': $(instance).attr("callback"),
                'messageDateTime' : Date.now()
            };
            //$('#' + objInfo.CurrentControlId).data("messageid").value
            K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._broadcastPostMessageToChildren(JSON.stringify(x));
        },

        _broadcastPostMessage: function (objInfo) {
            K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._sendPostMessageToParent(objInfo);
            K2Field.SmartForms.BrowserMessaging.BrowserMessagingSendControl._sendPostMessageToChildren(objInfo);
        },

        _broadcastPostMessageToChildren: function (data) {

            // get all iframes in this window - iterate over them and postMessage to each
            var frames = $('iframe');
            for (var i = 0; i < frames.length; i++) {
                frames[i].contentWindow.postMessage(data, '*');
            }
        }

    };
})(jQuery);

$(document).ready(function () {

    //add a delegate event handler for user-driven clicks 
    //TODO: add events for other user-driven events. 
    //(Note that custom controls created with the SDK have .SFC as the class)
    //you could also use event binding, if preferred 

    //$(document).delegate('.SFC.K2Field.SmartForms.BrowserMessaging-BrowserMessagingSendControl-Control', 'click.Control', function (e) {
    //    //alert("control " + this.id + " clicked");
    //    raiseEvent(this.id, 'Control', 'OnClick');
    //});

    //$(document).delegate(".SFC.K2Field.SmartForms.BrowserMessaging-BrowserMessagingSendControl-Control", "change.Control", function (e) {
    //    //alert("control " + this.id + " changed");
    //    raiseEvent(this.id, 'Control', 'OnChange');
    //});
});