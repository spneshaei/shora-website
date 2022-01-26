// const base_url = 'https://api.shora.taha7900.ir/api';
const base_url = 'http://localhost:8000/api';
const links = {
    'login': base_url + '/auth/login',
    'sendEmail': base_url + '/auth/send-reset-mail',
    'resetPass': base_url + '/auth/reset-pass',
    'checkLogin': base_url + '/auth/check-login',
    'completeInfo': base_url + '/auth/complete-info',
    'logout': base_url + '/auth/logout',
    'changePassword': base_url + '/auth/change-password',
    'getUsers': base_url + '/users',
    'getLockers': base_url + '/lockers',
    'getAllLockers': base_url + '/lockers/all',
    'getStudentNumbers': base_url + "/users/student-numbers",
    'registerUser': base_url + "/auth/register",
    'banUser': base_url + "/users/ban",
    'addRent': base_url + "/rents/add",
    'getRents': base_url + "/rents",
    'finishRent': base_url + "/rents/return",
    'addTransaction': base_url + "/transactions/add",
    'getTransactions': base_url + "/transactions",
    'lostAndFound': base_url + "/lost-and-found",
    'events': base_url + "/events",
    'registerUserInEvent': base_url + "/events/register",
    'getDemands': base_url + "/demands",
    'likeDemand': base_url + "/demands/like",
    'unlikeDemand' : base_url + "/demands/unlike",
    'banDemand': base_url + "/demands/ban-user"
}

export default links;