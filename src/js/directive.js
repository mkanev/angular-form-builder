"use strict";

angular.module('builder.directive', ['builder.provider', 'builder.controller', 'builder.drag', 'validator']).directive('fbBuilder', [
  '$injector', function ($injector) {
    return {
      restrict: 'A',
      template: "<div class='form-horizontal'>\n    <div class='fb-form-object-editable' ng-repeat=\"object in formObjects\"\n        fb-form-object-editable=\"object\"></div>\n</div>",
      link: function (scope, element, attrs) {
        var $builder, $drag, beginMove, _base, _name;
        $builder = $injector.get('$builder');
        $drag = $injector.get('$drag');
        scope.formName = attrs.fbBuilder;
        if ((_base = $builder.forms)[_name = scope.formName] === null) {
          _base[_name] = [];
        }
        scope.formObjects = $builder.forms[scope.formName];
        beginMove = true;
        $(element).addClass('fb-builder');
        return $drag.droppable($(element), {
          move: function (e) {
            var $empty, $formObject, $formObjects, height, index, offset, positions, _i, _j, _ref, _ref1;
            if (beginMove) {
              $("div.fb-form-object-editable").popover('hide');
              beginMove = false;
            }
            $formObjects = $(element).find('.fb-form-object-editable:not(.empty,.dragging)');
            if ($formObjects.length === 0) {
              if ($(element).find('.fb-form-object-editable.empty').length === 0) {
                $(element).find('>div:first').append($("<div class='fb-form-object-editable empty'></div>"));
              }
              return;
            }
            positions = [];
            positions.push(-1000);
            for (index = _i = 0, _ref = $formObjects.length; _i < _ref; index = _i += 1) {
              $formObject = $($formObjects[index]);
              offset = $formObject.offset();
              height = $formObject.height();
              positions.push(offset.top + height / 2);
            }
            positions.push(positions[positions.length - 1] + 1000);
            for (index = _j = 1, _ref1 = positions.length - 1; _j <= _ref1; index = _j += 1) {
              if (e.pageY > positions[index - 1] && e.pageY <= positions[index]) {
                $(element).find('.empty').remove();
                $empty = $("<div class='fb-form-object-editable empty'></div>");
                if (index - 1 < $formObjects.length) {
                  $empty.insertBefore($($formObjects[index - 1]));
                } else {
                  $empty.insertAfter($($formObjects[index - 2]));
                }
                break;
              }
            }
          },
          out: function () {
            if (beginMove) {
              $("div.fb-form-object-editable").popover('hide');
              beginMove = false;
            }
            return $(element).find('.empty').remove();
          },
          up: function (e, isHover, draggable) {
            var formObject, newIndex, oldIndex;
            beginMove = true;
            if (!$drag.isMouseMoved()) {
              $(element).find('.empty').remove();
              return;
            }
            if (!isHover && draggable.mode === 'drag') {
              formObject = draggable.object.formObject;
              if (formObject.editable) {
                $builder.removeFormObject(attrs.fbBuilder, formObject.index);
              }
            } else if (isHover) {
              if (draggable.mode === 'mirror') {
                $builder.insertFormObject(scope.formName, $(element).find('.empty').index('.fb-form-object-editable'), {
                  component: draggable.object.componentName
                });
              }
              if (draggable.mode === 'drag') {
                oldIndex = draggable.object.formObject.index;
                newIndex = $(element).find('.empty').index('.fb-form-object-editable');
                if (oldIndex < newIndex) {
                  newIndex--;
                }
                $builder.updateFormObjectIndex(scope.formName, oldIndex, newIndex);
              }
            }
            return $(element).find('.empty').remove();
          }
        });
      }
    };
  }
]).directive('fbFormObjectEditable', [
  '$injector', function ($injector) {
    return {
      restrict: 'A',
      controller: 'fbFormObjectEditableController',
      link: function (scope, element, attrs) {
        var $builder, $compile, $drag, $parse, $validator, component, formObject, popover, view;
        $builder = $injector.get('$builder');
        $drag = $injector.get('$drag');
        $parse = $injector.get('$parse');
        $compile = $injector.get('$compile');
        $validator = $injector.get('$validator');
        scope.inputArray = [];
        formObject = $parse(attrs.fbFormObjectEditable)(scope);
        component = $builder.components[formObject.component];
        scope.setupScope(formObject);
        view = $compile(component.template)(scope);
        $(element).append(view);
        $(element).on('click', function () {
          return false;
        });
        $drag.draggable($(element), {
          object: {
            formObject: formObject
          }
        });
        if (!formObject.editable) {
          return;
        }
        popover = {
          id: "fb-" + (Math.random().toString().substr(2)),
          isClickedSave: false,
          view: null,
          html: component.popoverTemplate
        };
        popover.html = $(popover.html).addClass(popover.id);
        scope.popover = {
          save: function ($event) {

            /*
             The save event of the popover.
             */
            $event.preventDefault();
            $validator.validate(scope).success(function () {
              popover.isClickedSave = true;
              return $(element).popover('hide');
            });
          },
          remove: function ($event) {

            /*
             The delete event of the popover.
             */
            $event.preventDefault();
            $builder.removeFormObject(scope.formName, scope.$index);
            $(element).popover('hide');
          },
          shown: function () {

            /*
             The shown event of the popover.
             */
            scope.data.backup();
            return popover.isClickedSave = false;
          },
          cancel: function ($event) {

            /*
             The cancel event of the popover.
             */
            scope.data.rollback();
            if ($event) {
              $event.preventDefault();
              $(element).popover('hide');
            }
          }
        };
        popover.view = $compile(popover.html)(scope);
        $(element).addClass(popover.id);
        $(element).popover({
          html: true,
          title: component.label,
          content: popover.view,
          container: 'body'
        });
        $(element).on('show.bs.popover', function () {
          var $popover, elementOrigin, popoverTop;
          if ($drag.isMouseMoved()) {
            return false;
          }
          $("div.fb-form-object-editable:not(." + popover.id + ")").popover('hide');
          $popover = $("form." + popover.id).closest('.popover');
          if ($popover.length > 0) {
            elementOrigin = $(element).offset().top + $(element).height() / 2;
            popoverTop = elementOrigin - $popover.height() / 2;
            $popover.css({
              position: 'absolute',
              top: popoverTop
            });
            $popover.show();
            setTimeout(function () {
              $popover.addClass('in');
              return $(element).triggerHandler('shown.bs.popover');
            }, 0);
            return false;
          }
        });
        $(element).on('shown.bs.popover', function () {
          $(".popover ." + popover.id + " input:first").select();
          scope.$apply(function () {
            return scope.popover.shown();
          });
        });
        return $(element).on('hide.bs.popover', function () {
          var $popover;
          $popover = $("form." + popover.id).closest('.popover');
          if (!popover.isClickedSave) {
            if (scope.$$phase) {
              scope.popover.cancel();
            } else {
              scope.$apply(function () {
                return scope.popover.cancel();
              });
            }
          }
          $popover.removeClass('in');
          setTimeout(function () {
            return $popover.hide();
          }, 300);
          return false;
        });
      }
    };
  }
]).directive('fbComponents', function () {
  return {
    restrict: 'A',
    template: "<ul ng-if=\"groups.length > 1\" class=\"nav nav-tabs nav-justified\">\n    <li ng-repeat=\"group in groups\" ng-class=\"{active:activeGroup==group}\">\n        <a href='#' ng-click=\"selectGroup($event, group)\">{{group}}</a>\n    </li>\n</ul>\n<div class='form-horizontal'>\n    <div class='fb-component' ng-repeat=\"component in components\"\n        fb-component=\"component\"></div>\n</div>",
    controller: 'fbComponentsController'
  };
}).directive('fbComponent', [
  '$injector', function ($injector) {
    return {
      restrict: 'A',
      controller: 'fbComponentController',
      link: function (scope, element, attrs) {
        var $builder, $compile, $drag, $parse, component, view;
        $builder = $injector.get('$builder');
        $drag = $injector.get('$drag');
        $parse = $injector.get('$parse');
        $compile = $injector.get('$compile');
        component = $parse(attrs.fbComponent)(scope);
        scope.copyObjectToScope(component);
        $drag.draggable($(element), {
          mode: 'mirror',
          defer: false,
          object: {
            componentName: component.name
          }
        });
        view = $compile(component.template)(scope);
        return $(element).append(view);
      }
    };
  }
]).directive('fbForm', [
  '$injector', function ($injector) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        formName: '@fbForm',
        input: '=ngModel',
        "default": '=fbDefault'
      },
      template: "<div class='fb-form-object' ng-repeat=\"object in form\" fb-form-object=\"object\"></div>",
      controller: 'fbFormController',
      link: function (scope, element, attrs) {
        var $builder, _base, _name;
        $builder = $injector.get('$builder');
        if ((_base = $builder.forms)[_name = scope.formName] === null) {
          _base[_name] = [];
        }
        return scope.form = $builder.forms[scope.formName];
      }
    };
  }
]).directive('fbFormObject', [
  '$injector', function ($injector) {
    return {
      restrict: 'A',
      controller: 'fbFormObjectController',
      link: function (scope, element, attrs) {
        var $builder, $compile, $input, $parse, $template, component, view;
        $builder = $injector.get('$builder');
        $compile = $injector.get('$compile');
        $parse = $injector.get('$parse');
        scope.formObject = $parse(attrs.fbFormObject)(scope);
        component = $builder.components[scope.formObject.component];
        scope.$on($builder.broadcastChannel.updateInput, function () {
          return scope.updateInput(scope.inputText);
        });
        if (component.arrayToText) {
          scope.inputArray = [];
          scope.$watch('inputArray', function (newValue, oldValue) {
            var checked, index;
            if (newValue === oldValue) {
              return;
            }
            checked = [];
            for (index in scope.inputArray) {
              if (scope.inputArray[index]) {
                checked.push(scope.options[index]);
              }
            }
            return scope.inputText = checked.join(', ');
          }, true);
        }
        scope.$watch('inputText', function () {
          return scope.updateInput(scope.inputText);
        });
        scope.$watch(attrs.fbFormObject, function () {
          return scope.copyObjectToScope(scope.formObject);
        }, true);
        $template = $(component.template);
        $input = $template.find("[ng-model='inputText']");
        $input.attr({
          validator: '{{validation}}'
        });
        view = $compile($template)(scope);
        $(element).append(view);
        if (!component.arrayToText && scope.formObject.options.length > 0) {
          scope.inputText = scope.formObject.options[0];
        }
        return scope.$watch("default[" + scope.formObject.id + "]", function (value) {
          if (!value) {
            return;
          }
          if (component.arrayToText) {
            return scope.inputArray = value;
          } else {
            return scope.inputText = value;
          }
        });
      }
    };
  }
]);