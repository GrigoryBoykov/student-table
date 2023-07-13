// получение всех инпутов
const button = document.getElementById('button-add');
const form = document.getElementById('form__getInfo');
const inputSurname = document.getElementById('FormControlInput1');
const inputName = document.getElementById('FormControlInput2');
const inputMiddlename = document.getElementById('FormControlInput3');
const inputFaculty = document.getElementById('FormControlInput4');
const inputDate = document.getElementById('FormControlInput5');
const inputYearStart = document.getElementById('FormControlInput6');

const formFilter = document.getElementById('form__filter')
const inputFilterFIO = document.getElementById('FormFilter1');
const inputFilterFaculty = document.getElementById('FormFilter2');
const inputFilterBirth = document.getElementById('FormFilter3');
const inputFilterYearStudy = document.getElementById('FormFilter4');


// создание шапки таблицы
const app = document.getElementById('app');
const table = document.createElement('table');
const tableHead = document.createElement('thead');
const tableBody = document.createElement('tbody');
const tableHeadTr = document.createElement('tr');
const tableHeadThFIO = document.createElement('th');
const tableHeadThFaculty = document.createElement('th');
const tableHeadThAge = document.createElement('th');
const tableHeadThCourse = document.createElement('th');

tableHeadThFIO.classList.add('sort-button');
tableHeadThFaculty.classList.add('sort-button');
tableHeadThAge.classList.add('sort-button');
tableHeadThCourse.classList.add('sort-button');


table.classList.add('table', 'table-light');

tableHeadThFIO.textContent = 'ФИО';
tableHeadThFaculty.textContent = 'Факультет';
tableHeadThAge.textContent = 'Дата рождения и возраст';
tableHeadThCourse.textContent = 'Годы обучения и номер курса';

tableHeadTr.append(tableHeadThFIO, tableHeadThFaculty, tableHeadThAge, tableHeadThCourse);
tableHead.append(tableHeadTr);
table.append(tableHead, tableBody);
app.append(table);

const SERVER_URL = 'http://localhost:3000';

async function serverAddStudent(obj) {
  let response = await fetch(SERVER_URL + '/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  });

  let data = await response.json();

  return data;
}

async function serverGetStudent() {
  let response = await fetch(SERVER_URL + '/api/students', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  let data = await response.json();

  return data;
}

async function serverDeleteStudent(id) {
  let response = await fetch(SERVER_URL + '/api/students/' + id, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  let data = await response.json();

  return data;
}

let serverData = await serverGetStudent();

let studentsList = [];

if (serverData) {
  studentsList = serverData;
}

let sortColumnFlag = 'fio';
let sortDirFlag = true;

form.addEventListener('submit', async  function(e) {

  e.preventDefault();

  if (validation(this) == true) {

    let addAll = {
      name: inputName.value.trim(),
      surname: inputSurname.value.trim(),
      lastname: inputMiddlename.value.trim(),
      birthday: inputDate.valueAsDate,
      faculty: inputFaculty.value.trim(),
      studyStart: inputYearStart.value,
    };

    let serverDataObj = await serverAddStudent(addAll);

    studentsList.push(serverDataObj);
  }

  e.target.reset();
});

createItem(studentsList);

// валидация
function validation(form) {

  function removeError(input) {
    const parent = input.parentNode;

    if (parent.classList.contains('error')) {
      parent.querySelector('.error-label').remove();
      parent.classList.remove('error');
    }
  }

  function createError(input, text) {
    const parent = input.parentNode;
    const errorLabel = document.createElement('label');

    errorLabel.classList.add('error-label');
    errorLabel.textContent = text;
    parent.classList.add('error');

    parent.append(errorLabel);
  }

  let result = true;

  const allInputs = form.querySelectorAll('input');

  for (const input of allInputs) {

    removeError(input);

    const now = new Date();
    const nowYear = now.getFullYear();
    const date = new Date(inputDate.valueAsDate);

    if (input.value.trim() == '') {
      removeError(input);
      createError(input, 'Поле не заполнено');
      result = false;
    }

    if(input.dataset.minLength) {
      if (input.value.trim().length < input.dataset.minLength) {
        removeError(input);
        createError(input, `Минимальное количество символов: ${input.dataset.minLength}`);
        result = false;
      }
    }

    if(input.classList.contains('form__date')) {
      if (date.getFullYear() < 1900 || date.getFullYear() > nowYear) {
        removeError(input);
        createError(input, 'Дата рождения введена неверно');
        result = false;
      }
    }

    if(input.classList.contains('form__year')) {
      if (input.value.trim().length != 4) {
        removeError(input);
        createError(input, 'Количество символов должно быть 4');
        result = false;
        return result
      }
      if (!isNaN(inputYearStart.value)) {
        if (inputYearStart.value < 2000 || inputYearStart.value > nowYear) {
          removeError(input);
          createError(input, 'Год начала обучения введен неверно');
          result = false;
        }
      } else {
        removeError(input);
        createError(input, 'Введите год цифрами');
        result = false;
      }
    }
  }

  return result;
}

// функция форматирования даты рождения
function formatDate(date) {
  const now = new Date();
  const nowYear = now.getFullYear();

  let day = date.getDate();
  if (day < 10) day = `0${day}`;

  let month = date.getMonth() + 1;
  if (month < 10) month = `0${month}`;

  const year = date.getFullYear();

  const age = nowYear - year;

  return day + '.' + month + '.' + year + ' ' + `(${age})`;
}

// функция определения на каком курсе учится студент
function periodOfStudy(yearStart) {
  const now = new Date();
  const nowYear = now.getFullYear();
  let nowMonth = now.getMonth() + 1;
  const yearEnd = yearStart + 4;

  if (nowMonth < 10) nowMonth = `0${nowMonth}`;

  if (Number(nowMonth) > 9 && nowYear >= yearEnd || nowYear >= yearEnd + 1) {
    return `${yearStart}-${yearEnd} ` + '(закончил)';
  } if (Number(nowMonth) >= 9 && nowYear < yearEnd) {
    const course = nowYear - yearStart + 1;
    return `${yearStart}-${yearEnd} ` + `(${course}) курс`;
  } if (Number(nowMonth) < 9 && yearEnd === nowYear) {
    const course = nowYear - yearStart;
    return `${yearStart}-${yearEnd} ` + `(${course} курс)`;
  } if (Number(nowMonth) < 9 && nowYear < yearEnd) {
    const course = nowYear - yearStart;
    return `${yearStart}-${yearEnd} ` + `(${course} курс)`;
  }
}

// заполнение строки данными
function createUserTr(oneUser) {

  const userTr = document.createElement('tr');
  const userThFIO = document.createElement('th');
  const userThFaculty = document.createElement('th');
  const userThAge = document.createElement('th');
  const userThCourse = document.createElement('th');
  const deleteButton = document.createElement('button');

  deleteButton.textContent = 'Удалить студента';
  deleteButton.classList.add('btn', 'btn-danger', 'delete');
  userThCourse.classList.add('d-flex', 'justify-content-between', 'align-items-center');
  userThFIO.textContent = oneUser.fio;
  userThFaculty.textContent = oneUser.faculty;
  userThAge.textContent = formatDate(new Date(oneUser.birthday));
  userThCourse.textContent = periodOfStudy(Number(oneUser.studyStart));

  userThCourse.append(deleteButton);
  userTr.append(userThFIO, userThFaculty, userThAge, userThCourse);

  const allTh = userTr.querySelectorAll('th');

  allTh.forEach((el) => {
    el.classList.add("thCenter");
  });

  deleteButton.addEventListener('click', async () => {
    if (confirm('Вы уверены?')) {
      serverDeleteStudent(oneUser.id);
      userTr.remove();
    }
  });

  return userTr;
}

// создание новой строки таблицы
function createItem(array) {

  tableBody.innerHTML = '';

  let copyList = [...array];

  for (const oneUser of copyList) {
    oneUser.fio = `${oneUser.surname} ${oneUser.name} ${oneUser.lastname}`;
  }

  // сортировка
  copyList = copyList.sort(function(a, b) {
    let sort = a[sortColumnFlag] < b[sortColumnFlag];

    if (sortDirFlag === false) sort = a[sortColumnFlag] > b[sortColumnFlag];

    if (sort) return - 1;
  });

  // фильтрация
  if (inputFilterFIO.value.trim() !== "") {
    copyList = filter(copyList, 'fio', inputFilterFIO.value);
  };

  if (inputFilterFaculty.value.trim() !== "") {
    copyList = filter(copyList, 'faculty', inputFilterFaculty.value);
  };

  if (inputFilterBirth.value.trim() !== "") {
    copyList = filter(copyList, 'birthday', inputFilterBirth.value);
  };

  if (inputFilterYearStudy.value.trim() !== "") {
    copyList = filter(copyList, 'studyStart', inputFilterYearStudy.value);
  };

  //отрисовка
  for (const oneUser of copyList) {
    const newTr = createUserTr(oneUser);
    tableBody.append(newTr);
  };
}

// кнопки сортировки
tableHeadThFIO.addEventListener('click', () => {
  sortColumnFlag = 'fio';
  sortDirFlag = !sortDirFlag;
  createItem(studentsList);
});

tableHeadThFaculty.addEventListener('click', () => {
  sortColumnFlag = 'faculty';
  sortDirFlag = !sortDirFlag;
  createItem(studentsList);
});

tableHeadThAge.addEventListener('click', () => {
  sortColumnFlag = 'birthday';
  sortDirFlag = !sortDirFlag;
  createItem(studentsList);
});

tableHeadThCourse.addEventListener('click', () => {
  sortColumnFlag = 'studyStart';
  sortDirFlag = !sortDirFlag;
  createItem(studentsList);
});

// фильтрация

formFilter.addEventListener('submit', function(event) {
  event.preventDefault();
});

function filter(array, property, value) {
  return array.filter(function(oneUser) {
    if (oneUser[property].includes(value.trim())) return true;
  });
};

inputFilterFIO.addEventListener('input', () => {
  createItem(studentsList);
});

inputFilterFaculty.addEventListener('input', () => {
  createItem(studentsList);
});

inputFilterBirth.addEventListener('input', () => {
  createItem(studentsList);
});

inputFilterYearStudy.addEventListener('input', () => {
  createItem(studentsList);
});
