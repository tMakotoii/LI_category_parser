const proxyServer = "https://api.allorigins.win/get?url=";
let resultData = [];


function getCategoryPages(doc) {
    console.log('начинаем получать страницы');
    try {
        // Находим все ссылки, соответствующие критерию
        const links = doc.querySelectorAll(`a[href*="queries.html${getPeriodValue()}&page="]`);

        // Извлекаем значения page из href и определяем максимальное значение
        let maxPage = 0;
        links.forEach(link => {
            const urlParams = new URLSearchParams(new URL(link.href).search);
            const pageParam = urlParams.get('page');
            if (pageParam && !isNaN(pageParam)) {
                const page = parseInt(pageParam, 10);
                if (page > maxPage) {
                    maxPage = page;
                }
            }
        });

        console.log(`Максимальное значение page: ${maxPage}`);
        return maxPage;
    } catch (error) {
        console.error("Error parsing HTML or extracting page numbers:", error);
    }
}


async function baseRequest(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // Читаем тело ответа как текст
        const htmlString = await response.text();

        // Преобразуем текст в JSON
        const parsedResponse = JSON.parse(htmlString);

        // Теперь мы можем безопасно обращаться к содержимому
        const contents = parsedResponse.contents;

        const parser = new DOMParser();
        const doc = parser.parseFromString(contents, 'text/html');
        console.log(doc)
        return doc;

    } catch (error) {
        console.error('Error:', error);
    }
}




async function mainRequest(urlCategory, pageCount) {
    console.log('начало mainRequest', urlCategory, pageCount);
    try {
        let fullyData = [];
        for (let i = 2; i <= pageCount; i++) {
            console.log('цикл for', i);
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

            // Ждем окончания задержки случайной/неслучайной длинны перед выполнением запроса
            // await delay(Math.floor(Math.random() * (3500 - 1000 + 1)) + 1000);
            await delay(1500);

            let encodedUrl = encodeURIComponent(`${urlCategory}&page=${i}`);
            let response = await fetch(`${proxyServer}${encodedUrl}`);

            console.log('ссылка в цикле', `${proxyServer}${urlCategory}&page=${i}`);
            console.log('ссылка целевая', `${urlCategory}&page=${i}`);

            // Проверяем статус ответа
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}. Retrying...`);
                // Здесь вы можете повторить запрос или выбрать другое действие
                continue; // Переходим к следующей итерации цикла
            }

            const htmlString = await response.text();
            const parsedResponse = JSON.parse(htmlString);
            const contents = parsedResponse.contents;
            const parser = new DOMParser();
            const pony = parser.parseFromString(contents, 'text/html');

            let res = pageTableParse(pony);

            fullyData.push(...res);
            console.log('длинна фулиДаты', fullyData.length);
            console.log('дата которую пушим в фулиДата', res);
        }

        return fullyData;
    } catch (error) {
        console.error('Error:', error);
    }
}


function pageTableParse(rawDocument) {
    const tableRows = rawDocument.querySelectorAll('table[bgcolor][cellpadding][cellspacing][border] tbody tr');
    const data = [];

    tableRows.forEach(function(row, index) {
        if (row.children.length < 3) return;
        if (index === 0) return;

        const rowData = {};
        rowData.keyQuery = row.children[1].textContent.trim();
        rowData.frequency = row.children[2].textContent.trim();

        data.push(rowData);
    });
    
    let filteredData = data.filter(rowData => !(rowData.keyQuery === 'total' || rowData.keyQuery === 'amount of selected'));

    if (getPeriodValue() === '?period=month') {
        filteredData = data.filter(rowData => !(rowData.keyQuery === 'Others'));
    }

    console.log('Парсинг одной страницы. Результат:', filteredData);
    return filteredData;
}



function getYesterdayDate(dateValue) {
    let date = new Date(); // Получаем текущую дату

    if (dateValue === 'yesterday') {
        date.setDate(date.getDate() - 1); // Устанавливаем дату на один день назад
    }
    
    let year = date.getFullYear(); // Получаем год
    let month = (date.getMonth() + 1).toString(); // Получаем месяц и приводим его к строке
    let day = date.getDate().toString(); // Получаем день и приводим его к строке
    
    // Добавляем ведущий ноль к месяцу и дню, если они однозначные
    month = month.padStart(2, '0');
    day = day.padStart(2, '0');
    
    // Возвращаем дату в формате YYYY-MM-DD
    return `${year}-${month}-${day}`;
}
  
  
function getPeriodValue() {
    const period = document.getElementById('preiod-select').value;
    switch (period) {
        case 'today':
            return `?date=${getYesterdayDate('today')}`;
            break;
        case 'yesterday':
            return `?date=${getYesterdayDate('yesterday')}`;
            break;
        case 'week':
            return '?period=week';
            break;
        case 'month':
            return '?period=month';
            break;
    }
    
}


function displayObjects(resultData) {
    const resultBlockDiv = document.getElementById('resultBlock');
    
    resultBlockDiv.innerHTML = '';
    
    if (!resultBlockDiv) {
        console.error('Element with id "resultBlock" not found.');
        return;
    }
    
    resultData.forEach((item, index) => {
        // Создаем div для каждого элемента resultData
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('itemResultRow');
        
        // Создаем два параграфа для хранения значений ключевых свойств
        const keyQueryParagraph = document.createElement('p');
        const frequencyParagraph = document.createElement('p');
        
        // Добавляем значения свойств в параграфы
        keyQueryParagraph.textContent = item.keyQuery;
        frequencyParagraph.textContent = item.frequency;
        
        // Добавляем параграфы в div
        itemDiv.appendChild(keyQueryParagraph);
        itemDiv.appendChild(frequencyParagraph);
        
        // Добавляем div с параграфами в resultBlockDiv
        resultBlockDiv.appendChild(itemDiv);
    });
}


function applyStopWords() {
    const stopWordsTextarea = document.getElementById('stopWords');
    const stopWordsInput = stopWordsTextarea.value;
    const stopWordsList = stopWordsInput.split(/\s+/).filter(Boolean);

    const resultBlock = document.getElementById('resultBlock');

    // Фильтруем resultData, исключая фразы, содержащие стоп-слова
    const filteredResultData = resultData.filter(item => {
        return !stopWordsList.some(stopWord => {
            // Строим регулярное выражение для каждого стоп-слова, ищем любую часть стоп-слова в keyQuery
            const regex = new RegExp(`(${stopWord})`, 'gi'); // 'g' для глобального поиска, 'i' для нечувствительности к регистру
            return regex.test(item.keyQuery);
        });
    });

    // Отображаем отфильтрованные данные
    displayObjects(filteredResultData);
}




async function main() {
    const categorySelect = document.getElementById('category-select').value;
    const periodSelect = getPeriodValue();

    let targetUrl = `https://www.liveinternet.ru/stat/ru/${categorySelect}/queries.html${getPeriodValue()}`;
    const fullUrl = proxyServer + targetUrl;

    console.log('Ссылка для базового(первого) перехода: ', fullUrl)

    let baseRequestResult = await baseRequest(fullUrl);
    let categoryPages = getCategoryPages(baseRequestResult)
    console.log('Кол-во страницы: ', categoryPages)

    let baseData = pageTableParse(baseRequestResult)
    let mainData = await mainRequest(targetUrl, categoryPages)

    console.log(mainData)
    resultData = [...baseData, ...mainData];

    console.log('КОНЕЦ. Результат(длина/массив): ', resultData.length, resultData)
    
    const keyQueries = resultData.map(item => item.keyQuery);
    console.log(keyQueries);

    displayObjects(resultData);

    // // Получаем элемент div по его id
    // const resultDiv = document.getElementById('resultBlock');

    // // Проходимся по каждому внутреннему массиву
    // resultData.forEach((itemArray) => {
    // // Создаем новый элемент p или любой другой, который вам подходит
    // const paragraph = document.createElement('p');
    
    // // Формируем строку из элементов внутреннего массива
    // const itemString = itemArray.join(', ');
    
    // // Устанавливаем текст элемента p
    // paragraph.textContent = itemString;
    
    // // Добавляем элемент p в div
    // resultDiv.appendChild(paragraph);
}
