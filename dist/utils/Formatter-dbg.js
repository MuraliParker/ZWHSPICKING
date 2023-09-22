/* global hcm, zhcm */

$.sap.declare("com.sap.parker.zwmpicking.utils.Formatter");

com.sap.parker.zwmpicking.utils.Formatter = {};


com.sap.parker.zwmpicking.utils.Formatter.checkBatch = function (value) {
	if(value === "X"){
        return false;
    }
    else{
        return false;
    }


};
com.sap.parker.zwmpicking.utils.Formatter.checkSerialNumber = function (value) {
	if(value === ""){
        return false;
    }
    else{
        return false;
    }

};

com.sap.parker.zwmpicking.utils.Formatter.mergeWHOrderTask = function (value1,value2,value3) {
	return value1 + " / " + value2 + " / " + value3;

};
com.sap.parker.zwmpicking.utils.Formatter.CheckLeadingZeros = function (value) {
if(value === "0.000"){
    return "";
}
else{
    return value;
}

};
com.sap.parker.zwmpicking.utils.Formatter.removepchar = function (value) {
    if(value[0] === "p"){
        value.substring(1);
    }
    else{
        return value;
    }
    
    };



