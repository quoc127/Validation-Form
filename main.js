function Validator(option) {
  var selectorRules = {};

  function getParentElement(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  function removeErrorMessage(inputElemnt) {
    var errorElemnt = getParentElement(
      inputElemnt,
      option.formGroupSelector
    ).querySelector(option.errorSelector);
    errorElemnt.innerText = "";
    getParentElement(inputElemnt, option.formGroupSelector).classList.remove(
      "invalid"
    );
  }

  function validate(inputElemnt, rule) {
    var errorElemnt = getParentElement(
      inputElemnt,
      option.formGroupSelector
    ).querySelector(option.errorSelector);
    var errorMessage;
    //Get rules for selector
    var rules = selectorRules[rule.selector];
    //loop rules and check
    for (var i = 0; i < rules.length; i++) {
      switch (inputElemnt.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElemnt.value);
          break;
      }

      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElemnt.innerText = errorMessage;
      getParentElement(inputElemnt, option.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      removeErrorMessage(inputElemnt);
    }
    return !errorMessage;
  }

  // get element for form need validate
  var formElement = document.querySelector(option.form);
  if (formElement) {
    //Handle submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var isFormValid = true;
      option.rules.forEach(function (rule) {
        var inputElemnt = formElement.querySelector(rule.selector);
        var isValid = validate(inputElemnt, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });
      if (isFormValid) {
        if (typeof option.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");
          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case "radio":
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;
                case "checkbox":
                  if (!Array.isArray(values[input.name])) {
                    values[input.name] = [];
                  }
                  if (input.matches(":checked")) {
                      values[input.name].push(input.value);
                  }
                  break;
              case "file":
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          },
          {});
          option.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };

    //Loop per rule and handle
    option.rules.forEach(function (rule) {
      //Save rule for per input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElemnts = formElement.querySelectorAll(rule.selector);

      Array.from(inputElemnts).forEach(function (inputElemnt) {
        // handle blur out input
        inputElemnt.onblur = function () {
          validate(inputElemnt, rule);
        };

        // hanlde when user enter value input
        inputElemnt.oninput = function () {
          removeErrorMessage(inputElemnt);
        };
      });

      // if (inputElemnt) {
      //   // handle blur out input
      //   inputElemnt.onblur = function () {
      //     validate(inputElemnt, rule);
      //   };

      //   // hanlde when user enter value input
      //   inputElemnt.oninput = function () {
      //     removeErrorMessage(inputElemnt);
      //   };
      // }
    });
  }
}

// define rule
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regexEmail.test(value)
        ? undefined
        : message || "Trường này phải là email";
    },
  };
};

Validator.minLength = function (selector, minLength) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= minLength
        ? undefined
        : `Vui lòng nhập tối thiểu ${minLength} ký tự`;
    },
  };
};

Validator.isConfirm = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
