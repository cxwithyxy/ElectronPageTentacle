export = {
    "touch_emulator_init": () =>
    {
            // 从别人的库中偷回来的代码
            // https://github.com/hammerjs/touchemulator
            // 能用就行了不是吗
            // 还要我搞一堆any包裹起来
            // 真的烦为啥别人不用typescript写

            var isMultiTouch = false;
            var multiTouchStartPos: any;
            var eventTarget: any;
            var touchElements = {};
        
            // polyfills
            if(!document.createTouch) {
                (<any>document).createTouch = function(view: any, target: any, identifier: any, pageX: any, pageY: any, screenX: any, screenY: any, clientX: any, clientY: any) {
                    // auto set
                    if(clientX == undefined || clientY == undefined) {
                        clientX = pageX - window.pageXOffset;
                        clientY = pageY - window.pageYOffset;
                    }
        
                    return new (<any>Touch)(target, identifier, {
                        pageX: pageX,
                        pageY: pageY,
                        screenX: screenX,
                        screenY: screenY,
                        clientX: clientX,
                        clientY: clientY
                    });
                };
            }
        
            if(!document.createTouchList) {
                document.createTouchList = function() {
                    var touchList = new (<any>TouchList)();
                    for (var i = 0; i < arguments.length; i++) {
                        touchList[i] = arguments[i];
                    }
                    touchList.length = arguments.length;
                    return touchList;
                };
            }
        
            /**
             * create an touch point
             * @constructor
             * @param target
             * @param identifier
             * @param pos
             * @param deltaX
             * @param deltaY
             * @returns {Object} touchPoint
             */
            class Touch
            {
                identifier: any
                target: any
                clientX: any
                clientY: any
                screenX: any
                screenY: any
                pageX: any
                pageY: any

                constructor(target: any, identifier: any, pos: any, deltaX: any, deltaY: any)
                {
                    deltaX = deltaX || 0;
                    deltaY = deltaY || 0;
                    
                    this.identifier = identifier;
                    this.target = target;
                    this.clientX = pos.clientX + deltaX;
                    this.clientY = pos.clientY + deltaY;
                    this.screenX = pos.screenX + deltaX;
                    this.screenY = pos.screenY + deltaY;
                    this.pageX = pos.pageX + deltaX;
                    this.pageY = pos.pageY + deltaY;
                }
            }
        
            /**
             * create empty touchlist with the methods
             * @constructor
             * @returns touchList
             */

            class TouchList extends Array
            {
                item(index: any)
                {
                    return this[index] || null;
                }
                identifiedTouch(id: any)
                {
                    return this[id + 1] || null;
                }
            }
        
        
            /**
             * Simple trick to fake touch event support
             * this is enough for most libraries like Modernizr and Hammer
             */
            function fakeTouchSupport() {
                var objs = [<any>window, document.documentElement];
                var props = ['ontouchstart', 'ontouchmove', 'ontouchcancel', 'ontouchend'];
        
                for(var o=0; o<objs.length; o++) {
                    for(var p=0; p<props.length; p++) {
                        if(objs[o] && objs[o][props[p]] == undefined) {
                            objs[o][props[p]] = null;
                        }
                    }
                }
            }
        
            /**
             * we don't have to emulate on a touch device
             * @returns {boolean}
             */
            function hasTouchSupport() {
                return false
            }
        
            /**
             * disable mouseevents on the page
             * @param ev
             */
            function preventMouseEvents(ev: any) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        
            /**
             * only trigger touches when the left mousebutton has been pressed
             * @param touchType
             * @returns {Function}
             */
            function onMouse(touchType: any) {
                return function(ev: any) {
                    // prevent mouse events
                    preventMouseEvents(ev);
        
                    if (ev.which !== 1) {
                        return;
                    }
        
                    // The EventTarget on which the touch point started when it was first placed on the surface,
                    // even if the touch point has since moved outside the interactive area of that element.
                    // also, when the target doesnt exist anymore, we update it
                    if (ev.type == 'mousedown' || !eventTarget || (eventTarget && !eventTarget.dispatchEvent)) {
                        eventTarget = ev.target;
                    }
        
                    // shiftKey has been lost, so trigger a touchend
                    if (isMultiTouch && !ev.shiftKey) {
                        triggerTouch('touchend', ev);
                        isMultiTouch = false;
                    }
        
                    triggerTouch(touchType, ev);
        
                    // we're entering the multi-touch mode!
                    if (!isMultiTouch && ev.shiftKey) {
                        isMultiTouch = true;
                        multiTouchStartPos = {
                            pageX: ev.pageX,
                            pageY: ev.pageY,
                            clientX: ev.clientX,
                            clientY: ev.clientY,
                            screenX: ev.screenX,
                            screenY: ev.screenY
                        };
                        triggerTouch('touchstart', ev);
                    }
        
                    // reset
                    if (ev.type == 'mouseup') {
                        multiTouchStartPos = null;
                        isMultiTouch = false;
                        eventTarget = null;
                    }
                }
            }
        
            /**
             * trigger a touch event
             * @param eventName
             * @param mouseEv
             */
            function triggerTouch(eventName: any, mouseEv: any) {
                var touchEvent = <any>document.createEvent('Event');
                touchEvent.initEvent(eventName, true, true);
        
                touchEvent.altKey = mouseEv.altKey;
                touchEvent.ctrlKey = mouseEv.ctrlKey;
                touchEvent.metaKey = mouseEv.metaKey;
                touchEvent.shiftKey = mouseEv.shiftKey;
        
                touchEvent.touches = getActiveTouches(mouseEv, eventName);
                touchEvent.targetTouches = getActiveTouches(mouseEv, eventName);
                touchEvent.changedTouches = getChangedTouches(mouseEv, eventName);
        
                eventTarget.dispatchEvent(touchEvent);
            }
        
            /**
             * create a touchList based on the mouse event
             * @param mouseEv
             * @returns {TouchList}
             */
            function createTouchList(mouseEv: any) {
                var touchList = new TouchList();
        
                if (isMultiTouch) {
                    var f = TouchEmulator.multiTouchOffset;
                    var deltaX = multiTouchStartPos.pageX - mouseEv.pageX;
                    var deltaY = multiTouchStartPos.pageY - mouseEv.pageY;
        
                    touchList.push(new Touch(eventTarget, 1, multiTouchStartPos, (deltaX*-1) - f, (deltaY*-1) + f));
                    touchList.push(new Touch(eventTarget, 2, multiTouchStartPos, deltaX+f, deltaY-f));
                } else {
                    touchList.push(new Touch(eventTarget, 1, mouseEv, 0, 0));
                }
        
                return touchList;
            }
        
            /**
             * receive all active touches
             * @param mouseEv
             * @returns {TouchList}
             */
            function getActiveTouches(mouseEv: any, eventName: any) {
                // empty list
                if (mouseEv.type == 'mouseup') {
                    return new TouchList();
                }
        
                var touchList = createTouchList(mouseEv);
                if(isMultiTouch && mouseEv.type != 'mouseup' && eventName == 'touchend') {
                    touchList.splice(1, 1);
                }
                return touchList;
            }
        
            /**
             * receive a filtered set of touches with only the changed pointers
             * @param mouseEv
             * @param eventName
             * @returns {TouchList}
             */
            function getChangedTouches(mouseEv: any, eventName: any) {
                var touchList = createTouchList(mouseEv);
        
                // we only want to return the added/removed item on multitouch
                // which is the second pointer, so remove the first pointer from the touchList
                //
                // but when the mouseEv.type is mouseup, we want to send all touches because then
                // no new input will be possible
                if(isMultiTouch && mouseEv.type != 'mouseup' &&
                    (eventName == 'touchstart' || eventName == 'touchend')) {
                    touchList.splice(0, 1);
                }
        
                return touchList;
            }
        
            /**
             * show the touchpoints on the screen
             */
            function showTouches(ev: any) {
                var touch, i, el, styles;
        
                // first all visible touches
                for(i = 0; i < ev.touches.length; i++) {
                    touch = ev.touches[i];
                    el = (<any>touchElements)[touch.identifier];
                    if(!el) {
                        el = (<any>touchElements)[touch.identifier] = document.createElement("div");
                        document.body.appendChild(el);
                    }
        
                    styles = TouchEmulator.template(touch);
                    for(var prop in styles) {
                        el.style[prop] = (<any>styles)[prop];
                    }
                }
        
                // remove all ended touches
                if(ev.type == 'touchend' || ev.type == 'touchcancel') {
                    for(i = 0; i < ev.changedTouches.length; i++) {
                        touch = ev.changedTouches[i];
                        el = (<any>touchElements)[touch.identifier];
                        if(el) {
                            el.parentNode.removeChild(el);
                            delete (<any>touchElements)[touch.identifier];
                        }
                    }
                }
            }
        
            /**
             * TouchEmulator initializer
             */
            function TouchEmulator() {
                if (hasTouchSupport()) {
                    return;
                }
        
                fakeTouchSupport();
        
                window.addEventListener("mousedown", onMouse('touchstart'), true);
                window.addEventListener("mousemove", onMouse('touchmove'), true);
                window.addEventListener("mouseup", onMouse('touchend'), true);
        
                window.addEventListener("mouseenter", preventMouseEvents, true);
                window.addEventListener("mouseleave", preventMouseEvents, true);
                window.addEventListener("mouseout", preventMouseEvents, true);
                window.addEventListener("mouseover", preventMouseEvents, true);
        
                // it uses itself!
                window.addEventListener("touchstart", showTouches, true);
                window.addEventListener("touchmove", showTouches, true);
                window.addEventListener("touchend", showTouches, true);
                window.addEventListener("touchcancel", showTouches, true);
            }
        
            // start distance when entering the multitouch mode
            TouchEmulator.multiTouchOffset = 75;
        
            /**
             * css template for the touch rendering
             * @param touch
             * @returns object
             */
            TouchEmulator.template = function(touch: any) {
                var size = 30;
                var transform = 'translate('+ (touch.clientX-(size/2)) +'px, '+ (touch.clientY-(size/2)) +'px)';
                return {
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    background: '#fff',
                    border: 'solid 1px #999',
                    opacity: .6,
                    borderRadius: '100%',
                    height: size + 'px',
                    width: size + 'px',
                    padding: 0,
                    margin: 0,
                    display: 'block',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    webkitUserSelect: 'none',
                    mozUserSelect: 'none',
                    userSelect: 'none',
                    webkitTransform: transform,
                    mozTransform: transform,
                    transform: transform,
                    zIndex: 100
                }
            };
        
            TouchEmulator();
    }
}