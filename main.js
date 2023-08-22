function Validator(option) {
  function removeErrorMessage(inputElemnt) {
    var errorElemnt = inputElemnt.parentElement.querySelector(option.errorSelector);
    errorElemnt.innerText = "";
    inputElemnt.parentElement.classList.remove("invalid");
  };

  function validate(inputElemnt, rule) {
    var errorElemnt = inputElemnt.parentElement.querySelector(option.errorSelector);
    var errorMessage = rule.test(inputElemnt.value);
    if (errorMessage) {
      errorElemnt.innerText = errorMessage;
      inputElemnt.parentElement.classList.add("invalid");
    } else {
        removeErrorMessage(inputElemnt);
    }
  };

  // get element for form need validate
  var formElement = document.querySelector(option.form);
  if (formElement) {
    option.rules.forEach(function (rule) {
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
}

// define rule
Validator.isRequired = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : "Vui lòng nhập";
    },
  };
};

Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      var regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regexEmail.test(value) ? undefined : "Trường này phải là email";
    },
  };
};

Validator.minLength = function (selector, minLength) {
    return {
      selector: selector,
      test: function (value) {
        return value.length >=  minLength ? undefined : `Vui lòng nhập tối thiểu ${minLength} ký tự`;
      },
    };
  };
