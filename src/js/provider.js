"use strict";

/*
 component:
 It is like a class.
 The base components are textInput, textArea, select, check, radio.
 User can custom the form with components.
 formObject:
 It is like an object (an instance of the component).
 User can custom the label, description, required and validation of the input.
 form:
 This is for end-user. There are form groups int the form.
 They can input the value to the form.
 */

var __indexOf = [].indexOf || function (item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item) return i;
  }
  return -1;
};

angular.module('builder.provider', []).provider('$builder', function () {
  this.version = '0.0.1';
  this.components = {};
  this.groups = [];
  this.broadcastChannel = {
    updateInput: '$updateInput'
  };
  this.forms = {
    "default": []
  };
  this.formsId = {
    "default": 0
  };
  this.convertComponent = function (name, component) {
    var result, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    result = {
      name: name,
      group: (_ref = component.group) != null ? _ref : 'Default',
      label: (_ref1 = component.label) != null ? _ref1 : '',
      description: (_ref2 = component.description) != null ? _ref2 : '',
      placeholder: (_ref3 = component.placeholder) != null ? _ref3 : '',
      editable: (_ref4 = component.editable) != null ? _ref4 : true,
      required: (_ref5 = component.required) != null ? _ref5 : false,
      validation: (_ref6 = component.validation) != null ? _ref6 : '/.*/',
      validationOptions: (_ref7 = component.validationOptions) != null ? _ref7 : [],
      options: (_ref8 = component.options) != null ? _ref8 : [],
      arrayToText: (_ref9 = component.arrayToText) != null ? _ref9 : false,
      template: component.template,
      popoverTemplate: component.popoverTemplate
    };
    if (!result.template) {
      console.error("The template is empty.");
    }
    if (!result.popoverTemplate) {
      console.error("The popoverTemplate is empty.");
    }
    return result;
  };
  this.convertFormObject = function (name, formObject) {
    var component, exist, form, result, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    if (formObject == null) {
      formObject = {};
    }
    component = this.components[formObject.component];
    if (component == null) {
      throw "The component " + formObject.component + " was not registered.";
    }
    if (formObject.id) {
      exist = false;
      _ref = this.forms[name];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        form = _ref[_i];
        if (!(formObject.id <= form.id)) {
          continue;
        }
        formObject.id = this.formsId[name]++;
        exist = true;
        break;
      }
      if (!exist) {
        this.formsId[name] = formObject.id + 1;
      }
    }
    result = {
      id: (_ref1 = formObject.id) != null ? _ref1 : this.formsId[name]++,
      component: formObject.component,
      editable: (_ref2 = formObject.editable) != null ? _ref2 : component.editable,
      index: (_ref3 = formObject.index) != null ? _ref3 : 0,
      label: (_ref4 = formObject.label) != null ? _ref4 : component.label,
      description: (_ref5 = formObject.description) != null ? _ref5 : component.description,
      placeholder: (_ref6 = formObject.placeholder) != null ? _ref6 : component.placeholder,
      options: (_ref7 = formObject.options) != null ? _ref7 : component.options,
      required: (_ref8 = formObject.required) != null ? _ref8 : component.required,
      validation: (_ref9 = formObject.validation) != null ? _ref9 : component.validation
    };
    return result;
  };
  this.reindexFormObject = (function (_this) {
    return function (name) {
      var formObjects, index, _i, _ref;
      formObjects = _this.forms[name];
      for (index = _i = 0, _ref = formObjects.length; _i < _ref; index = _i += 1) {
        formObjects[index].index = index;
      }
    };
  })(this);
  this.registerComponent = (function (_this) {
    return function (name, component) {
      var newComponent, _ref;
      if (component == null) {
        component = {};
      }

      /*
       Register the component for form-builder.
       @param name: The component name.
       @param component: The component object.
       group: {string} The component group.
       label: {string} The label of the input.
       description: {string} The description of the input.
       placeholder: {string} The placeholder of the input.
       editable: {bool} Is the form object editable?
       required: {bool} Is the form object required?
       validation: {string} angular-validator. "/regex/" or "[rule1, rule2]". (default is RegExp(.*))
       validationOptions: {array} [{rule: angular-validator, label: 'option label'}] the options for the validation. (default is [])
       options: {array} The input options.
       arrayToText: {bool} checkbox could use this to convert input (default is no)
       template: {string} html template
       popoverTemplate: {string} html template
       */
      if (_this.components[name] == null) {
        newComponent = _this.convertComponent(name, component);
        _this.components[name] = newComponent;
        if (_ref = newComponent.group, __indexOf.call(_this.groups, _ref) < 0) {
          _this.groups.push(newComponent.group);
        }
      } else {
        console.error("The component " + name + " was registered.");
      }
    };
  })(this);
  this.addFormObject = (function (_this) {
    return function (name, formObject) {
      var _base;
      if (formObject == null) {
        formObject = {};
      }

      /*
       Insert the form object into the form at last.
       */
      if ((_base = _this.forms)[name] == null) {
        _base[name] = [];
      }
      return _this.insertFormObject(name, _this.forms[name].length, formObject);
    };
  })(this);
  this.insertFormObject = (function (_this) {
    return function (name, index, formObject) {
      var _base, _base1;
      if (formObject == null) {
        formObject = {};
      }

      /*
       Insert the form object into the form at {index}.
       @param name: The form name.
       @param index: The form object index.
       @param form: The form object.
       id: {int} The form object id. It will be generate by $builder if not asigned.
       component: {string} The component name
       editable: {bool} Is the form object editable? (default is yes)
       label: {string} The form object label.
       description: {string} The form object description.
       placeholder: {string} The form object placeholder.
       options: {array} The form object options.
       required: {bool} Is the form object required? (default is no)
       validation: {string} angular-validator. "/regex/" or "[rule1, rule2]".
       [index]: {int} The form object index. It will be updated by $builder.
       @return: The form object.
       */
      if ((_base = _this.forms)[name] == null) {
        _base[name] = [];
      }
      if ((_base1 = _this.formsId)[name] == null) {
        _base1[name] = 0;
      }
      if (index > _this.forms[name].length) {
        index = _this.forms[name].length;
      } else if (index < 0) {
        index = 0;
      }
      _this.forms[name].splice(index, 0, _this.convertFormObject(name, formObject));
      _this.reindexFormObject(name);
      return _this.forms[name][index];
    };
  })(this);
  this.removeFormObject = (function (_this) {
    return function (name, index) {

      /*
       Remove the form object by the index.
       @param name: The form name.
       @param index: The form object index.
       */
      var formObjects;
      formObjects = _this.forms[name];
      formObjects.splice(index, 1);
      return _this.reindexFormObject(name);
    };
  })(this);
  this.updateFormObjectIndex = (function (_this) {
    return function (name, oldIndex, newIndex) {

      /*
       Update the index of the form object.
       @param name: The form name.
       @param oldIndex: The old index.
       @param newIndex: The new index.
       */
      var formObject, formObjects;
      if (oldIndex === newIndex) {
        return;
      }
      formObjects = _this.forms[name];
      formObject = formObjects.splice(oldIndex, 1)[0];
      formObjects.splice(newIndex, 0, formObject);
      return _this.reindexFormObject(name);
    };
  })(this);
  this.get = function () {
    return {
      version: this.version,
      components: this.components,
      groups: this.groups,
      forms: this.forms,
      broadcastChannel: this.broadcastChannel,
      registerComponent: this.registerComponent,
      addFormObject: this.addFormObject,
      insertFormObject: this.insertFormObject,
      removeFormObject: this.removeFormObject,
      updateFormObjectIndex: this.updateFormObjectIndex
    };
  };
  this.$get = this.get;
});