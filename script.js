const proxyServer = "https://api.allorigins.win/get?url=";


function getCategoryPages(doc) {
    console.log('начинаем получать страницы');

    try {
        // Выбираем все ссылки на странице
        const links = doc.querySelectorAll('a[href*="\\&quot;queries.html?\\&quot;"]');
        console.log('наши doc', doc);
        console.log('наши links', links);

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

        console.log(`Max Page Number: ${maxPage}`);
        return maxPage;
    } catch (error) {
        console.error("Error parsing HTML or extracting page numbers:", error);
    }
}



async function baseRequest(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        console.log('базовый запрос', doc)
        return doc;

    } catch (error) {
        console.error('Error:', error);
    }
}


async function mainRequest(urlCategory, pageCount) {
    console.log('начало mainRequest', urlCategory, pageCount)
    try {
        let fullyData = [];
        for (let i = 2; i <= pageCount; i++) {
            console.log('for be')
            // Создаем промис, который разрешается через заданный интервал времени
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
            
            // Ждем окончания задержки случайной/неслучайной длинны перед выполнением запроса
            // await delay(Math.floor(Math.random() * (3500 - 1000 + 1)) + 1000);
            await delay(1500);
            
            let encodedUrl = encodeURIComponent(`${urlCategory}?page=${i}`);
            let response = await fetch(`${proxyServer}${encodedUrl}`);
            console.log('ссылка в цикле', `${proxyServer}${encodedUrl}`);
            console.log('пидолрский json', response)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
            let html = await response.text();
            let parser = new DOMParser();
            let pony = parser.parseFromString(html, 'text/html');
        
            let res = pageTableParse(pony);

            fullyData.push(res);
            console.log('длинна фулиДаты', fullyData.length)
            console.log('дата которую пушим в фулиДата', res)
        }
        
        return fullyData;

    } catch (error) {
        console.error('Error:', error);
    }
}


function getSymbol() {
    if (getPeriodValue() == '') {
        return '?'
    } else {
        return '&'
    }
}

function pageTableParse(rawDocument) {
    // ВСе строки полученной таблицы. Сначала получаем таблицу с данными, затем все строки в ней
    console.log(rawDocument, 'rawka')
    const rows = rawDocument.querySelector('table[bgcolor][cellpadding][cellspacing][border]').querySelectorAll('tbody tr');
    console.log(rows, 'rows')
    const data = [];

    rows.forEach(function(row) {
        // Избегаем обработки заголовочных и итоговых строк
        if (row.children.length !== 10) return;

        // Инициализируем массив для текущей строки
        const rowData = [];

        // Заполняем массив ['ключевой запрос', 'частотность']
        rowData.push(
            row.children[1].textContent.trim(),
            row.children[2].textContent.trim()
        )
        // for (let i = 0; i < row.children.length; i++) {
        //     const cell = row.children[i];
        //     // Для ячеек с текстом добавляем текст, для ячеек с элементами - их текстовое содержимое

        //     rowData.push(i === 1 ? cell.textContent : cell.textContent || cell.firstChild.textContent);
        // }

        data.push(rowData);
    });

    console.log('Парсинг одной странциы. Результат:', data);
    return data;
}

// function pageTableParse(rawDocument) {
//     // ВСе строки полученной таблицы. Сначала получаем таблицу с данными, затем все строки в ней
//             console.log(rawDocument, 'rawka')
//     const rows = rawDocument.querySelector('table[bgcolor][cellpadding][cellspacing][border]').querySelectorAll('tbody tr');
//     const data = [];

//     rows.forEach(function(row) {
//         // Избегаем обработки заголовочных и итоговых строк
//         if (row.children.length !== 10) return;

//         // Инициализируем массив для текущей строки
//         const rowData = [];

//         // Заполняем массив ['ключевой запрос', 'частотность']
//         rowData.push(
//             row.children[1].textContent.trim(),
//             row.children[2].textContent.trim()
//         )
//         // for (let i = 0; i < row.children.length; i++) {
//         //     const cell = row.children[i];
//         //     // Для ячеек с текстом добавляем текст, для ячеек с элементами - их текстовое содержимое

//         //     rowData.push(i === 1 ? cell.textContent : cell.textContent || cell.firstChild.textContent);
//         // }

//         data.push(rowData);
//     });

//     console.log('Парсинг одной странциы. Результат:', data);
//     return data;
// }


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

    console.log('base data', baseData)

    console.log(mainData)
    let resultData = [...baseData, ...mainData];

    console.log('КОНЕЦ. Результат(длина/массив): ', resultData.length, resultData)


    // Получаем элемент div по его id
    const resultDiv = document.getElementById('resultBlock');

    // Проходимся по каждому внутреннему массиву
    resultData.forEach((itemArray) => {
    // Создаем новый элемент p или любой другой, который вам подходит
    const paragraph = document.createElement('p');
    
    // Формируем строку из элементов внутреннего массива
    const itemString = itemArray.join(', ');
    
    // Устанавливаем текст элемента p
    paragraph.textContent = itemString;
    
    // Добавляем элемент p в div
    resultDiv.appendChild(paragraph);
});

}