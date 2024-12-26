const stopWordsTemplates = document.querySelector('.stop-words-templates')
const ownTemplate = document.getElementById('saveOwnTemplate')

templates_list = {
    'bank': {
        id: 'bank',
        name: 'Банки',
        list: ['альфа', 'тбанк', 'сбер', 'сбербанк', 'втб']
    },
    'finance': {
        id: 'finance',
        name: 'Финансы',
        list: ['ставка', 'акции', 'рубль', 'доллар']
    }
}

templates_list['word'] = {
    id: 'word',
    name: 'Работа',
    list: ['вакансия', 'hh']
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

    displayObjects(filteredResultData);
}

function generateTemplateBlock(template) {
    return `
        <div class="template__block" id="${template.id}">
            <h2>${template.name}</h2>
            <ul class="template__block__list-short">
                ${template.list.slice(0, 2).map(item => `<li>${item}</li>`).join('')}
                ${template.list.length > 2 ? `<li>еще ${template.list.length - 2} стоп-слова</li>` : ''}
            </ul>
        </div>
    `;
}

const htmlContent = Object.values(templates_list).map(generateTemplateBlock).join('');
stopWordsTemplates.innerHTML = htmlContent;

const templateses = document.querySelectorAll('.template__block');
templateses.forEach(template => {
    template.addEventListener('click', (event) => {
        const targetElement = event.target;
        const templatesesId = template.id;

        const stopWordsTextarea = document.getElementById('stopWords');
        stopWordsTextarea.value = templates_list[templatesesId]['list'].join('\n')
        
    });
});
