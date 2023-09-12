function Validator(option) {
  var selectorRules = {};
  function removeErrorMessage(inputElemnt) {
    var errorElemnt = inputElemnt.parentElement.querySelector(
      option.errorSelector
    );
    errorElemnt.innerText = "";
    inputElemnt.parentElement.classList.remove("invalid");
  }

  function validate(inputElemnt, rule) {
    var errorElemnt = inputElemnt.parentElement.querySelector(
      option.errorSelector
    );
    var errorMessage;
    //Get rules for selector
    var rules = selectorRules[rule.selector];
    //loop rules and check
    for (var i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElemnt.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElemnt.innerText = errorMessage;
      inputElemnt.parentElement.classList.add("invalid");
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
          var formValues = Array.from(enableInputs).reduce(function (values,input) {
            return (values[input.name] = input.value) && values;
          },
          {});
          option.onSubmit(formValues);
        } else{
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

      var inputElemnt = formElement.querySelector(rule.selector);
      if (inputElemnt) {
        // handle blur out input
        inputElemnt.onblur = function () {
          validate(inputElemnt, rule);
        };

        // hanlde when user enter value input
        inputElemnt.oninput = function () {
          removeErrorMessage(inputElemnt);
        };
      }
    });
  }
  // console.log(selectorRules);
}

// define rule
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : message || "Vui lòng nhập trường này";
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
