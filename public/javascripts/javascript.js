function validate() {
  if (nameValidate() == true  && emailValidate() == true && mobileValidate() == true && passwordValidate() == true)
  {
    return true;
  } 
  else {
    alert("Please Enter Correct details")
    return false
  }
}

document.querySelector("#submit-form").addEventListener("submit", function(e){
    alert('Hai')
});

function nameValidate() {
  var varname = $("#name").val();
  var pattern = /^[a-zA-Z\\s]/;

  if (varname == "") {
    $("#errormsg4").html("Name is mandatory");
    return false;
  } else if (varname.match(pattern)) {
    $("#errormsg4").html("");
    return true;
  } else {
    $("#errormsg4").html("Enter correct name");
    return false;
  }
}

function emailValidate() {
  var varEmail = $("#email").val();
  var emailPattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

  if (varEmail == "") {
    $("#errormsg1").html("Email is mandatory");
    return false;
  } else if (varEmail.match(emailPattern)) {
    $("#errormsg1").html("");
    return true;
  } else {
    $("#errormsg1").html("Enter correct Email");
    return false;
  }
}

function mobileValidate() {
  var varMobile = $("#number").val();
  var mobilePattern = /^[0-9]{10}$/
  
  if(varMobile == ""){
    $("#errormsg2").html("Mobile Number is mandatory");
    return false;
  }
  else if (varMobile.length < 10 || varMobile.length > 10) {
    $("#errormsg2").html("Number should be 10 digits");
  } else if (varMobile.match(mobilePattern)) {
    $("#errormsg2").html("");
    return true;
  } else {
    $("#errormsg2").html("");
    return false;
  }
}

function passwordValidate() {
  var password = $("#password1").val();
  var confirmPassword = $("#password2").val();

  if (password == "") {
    $("#errormsg3").html("Password is mandatory");
    return false;
  } 
  else if (password.length > 16 || confirmPassword.length > 16) {
    $("#errormsg6").html("Password Should not exceed 16 characters");
    return false;
  } 
  else if (confirmPassword != password) {
    $("#errormsg6").html("Password doesn't matches");
    return false;
  } 
  else {
    $("#errormsg3").html("");
    $("#errormsg6").html("");
    return true;
  }
}


