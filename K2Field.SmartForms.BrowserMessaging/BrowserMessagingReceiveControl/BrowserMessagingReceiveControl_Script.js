//NOTE: alert() statements are available for debugging purposes. You can uncomment the statements to show dialogs when each method is hit.
(function ($) {
    //TODO: if necessary, add additional statements to initialize each part of the namespace before your BrowserMessagingReceiveControl is called. 
    if (typeof K2Field === 'undefined' || K2Field === null) K2Field = {};
    if (typeof K2Field.SmartForms === 'undefined' || K2Field.SmartForms === null) K2Field.SmartForms = {};
    if (typeof K2Field.SmartForms.BrowserMessaging === "undefined" || K2Field.SmartForms.BrowserMessaging == null) K2Field.SmartForms.BrowserMessaging = {};

    K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl = {

        //internal method used to get a handle on the control instance
        _getInstance: function (id) {
            //alert("_getInstance(" + id + ")");
            var control = jQuery('#' + id);
            if (control.length == 0) {
                throw 'BrowserMessagingReceiveControl \'' + id + '\' not found';
            } else {
                return control[0];
            }
        },

        getValue: function (objInfo) {
            //alert("getValue() for control " + objInfo.CurrentControlId);
            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl._getInstance(objInfo.CurrentControlId);
            return instance.value;
        },

        getDefaultValue: function (objInfo) {
            //alert("getDefaultValue() for control " + objInfo.CurrentControlId);
            getValue(objInfo);
        },

        setValue: function (objInfo) {
            //alert("setValue() for control " + objInfo.CurrentControlId);
            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl._getInstance(objInfo.CurrentControlId);
            var oldValue = instance.value;
            //only change the value if it has actually changed, and then raise the OnChange event
            if (oldValue != objInfo.Value) {
                instance.value = objInfo.Value;
                raiseEvent(objInfo.CurrentControlId, 'Control', 'OnChange');
            }
        },

        //retrieve a property for the control
        getProperty: function (objInfo) {
            //alert("getProperty(" + objInfo.property + ") for control " + objInfo.CurrentControlId);
            if (objInfo.property.toLowerCase() == "value") {
                return K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl.getValue(objInfo);
            }
            else {
                return $('#' + objInfo.CurrentControlId).attr(objInfo.property);
            }
        },

        //set a property for the control. note case statement to call helper methods
        setProperty: function (objInfo) {
            switch (objInfo.property.toLowerCase()) {
                case "style":
                    K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl.setStyles(null, objInfo.Value, $('#' + objInfo.CurrentControlId));
                    break;
                case "value":
                    K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl.setValue(objInfo);
                    break;
                case "isvisible":
                    K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl.setIsVisible(objInfo);
                    break;
                case "isenabled":
                    K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl.setIsEnabled(objInfo);
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
            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl._getInstance(objInfo.CurrentControlId);
            instance.style.display = displayValue;
        },

        //helper method to set control "enabled" state
        setIsEnabled: function (objInfo) {
            //alert("set_isEnabled: " + objInfo.Value);
            value = (objInfo.Value === true || objInfo.Value == 'true');
            this._isEnabled = value;
            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl._getInstance(objInfo.CurrentControlId);
            instance.readOnly = !value;
        },

        setStyles: function (wrapper, styles, target) {
            var isRuntime = (wrapper == null);
            var options = {};
            var element = isRuntime ? jQuery(target) : wrapper.find('.K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl');

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

            var instance = K2Field.SmartForms.BrowserMessaging.BrowserMessagingReceiveControl._getInstance(objInfo.CurrentControlID);

            // methodParameters is an object mapping the property names to their values
            var parameters = objInfo.methodParameters;

            var parameterNames = [];
            var method = objInfo.methodName;

            switch (method) {
                case "clearmessage":
                    instance.value = "";
                    $(instance).attr("messageid", "");
                    $(instance).attr("messagetype", "");
                    $(instance).attr("fromurl", "");
                    $(instance).attr("messagedatetime", "");
                    $(instance).attr("callback", "");
                    $(instance).attr("broadcast", "");

                    raiseEvent(objInfo.CurrentControlID, 'Control', 'OnMessageCleared');
                    break;
            }
            return data;
        },

    };
})(jQuery);

$(document).ready(function () {

    //add a delegate event handler for user-driven clicks 
    //TODO: add events for other user-driven events. 
    //(Note that custom controls created with the SDK have .SFC as the class)
    //you could also use event binding, if preferred 

    //$(document).delegate('.SFC.K2Field.SmartForms.BrowserMessaging-BrowserMessagingReceiveControl-Control', 'click.Control', function (e) {
    //    //alert("control " + this.id + " clicked");
    //    raiseEvent(this.id, 'Control', 'OnClick');
    //});

    //$(document).delegate(".SFC.K2Field.SmartForms.BrowserMessaging-BrowserMessagingReceiveControl-Control", "change.Control", function (e) {
    //    //alert("control " + this.id + " changed");
    //    raiseEvent(this.id, 'Control', 'OnChange');
    //});


    if (window.attachEvent) {
        attachEvent("onmessage", receiveMessage);
    } else {

        window.addEventListener("message", receiveMessage, false);
    }

    function receiveMessage(e) {
        var data = e.data;
        var origin = e.origin;
        console.log("MESSAGE RECEIVED: " + data);
        if (data.substring(0, 1) === '{') {
            var d = JSON.parse(e.data);

            var id = $(".K2Field-SmartForms-BrowserMessaging-BrowserMessagingReceiveControl-Control").attr("Id");
            $("#" + id).attr("value", d.message);

            //$("#" + id).data("messageId", d.messageId);

            //var controlOptions = jQuery.parseJSON($("#" + id).attr("data-options"));

            if (d.hasOwnProperty("messageType")) {
                $("#" + id).attr("messagetype", d.messageType);
                //controlOptions.messageType = d.messageType;
            }

            if (d.hasOwnProperty("messageId")) {
                $("#" + id).attr("messageid", d.messageId);
                //controlOptions.messageId = d.messageId;
            }

            if (d.hasOwnProperty("fromUrl")) {
                $("#" + id).attr("fromurl", d.fromUrl);
                //controlOptions.fromUrl = d.fromUrl;
            }

            if (d.hasOwnProperty("callback")) {
                $("#" + id).attr("callback", d.callback);
                //controlOptions.callback = d.callback;
            }

            if (d.hasOwnProperty("broadcast")) {
                $("#" + id).attr("broadcast", d.rebroadcast);
                //controlOptions.callback = d.callback;
            }


            if (d.hasOwnProperty("messageDateTime")) {
                $("#" + id).attr("messagedatetime", d.messageDateTime);
                //controlOptions.callback = d.callback;
            }

            //$("#" + id).attr("data-options", JSON.stringify(controlOptions));


            //$(id).attr("value", d.message);
            raiseEvent(id, 'Control', 'OnMessageReceived');

            if (d.hasOwnProperty("broadcast")) {
                if (d.broadcast == "true" || d.broadcast == true) {
                    var frames = $('iframe');

                    for (var i = 0; i < frames.length; i++) {
                        frames[i].contentWindow.postMessage(data, '*');
                    }
                }
            }

        } else {
            // broadcast strings
            var frames = $('iframe');
            for (var i = 0; i < frames.length; i++) {
                frames[i].contentWindow.postMessage(data, '*');
            }
        }

    }

});