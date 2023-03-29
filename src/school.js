const { publicSchoolsUrl } = require('./syllabusUrl');
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const inquirer = require('inquirer');

async function fetchSchoolList() {
    const htmlRaw = await axios.get(publicSchoolsUrl);
    const dom = new JSDOM(htmlRaw.data);

    const schoolList = dom.window.document.querySelectorAll(
        'table.school_table a.link_button.btn.btn-default'
    );
    const schools = [];
    for (const school of schoolList) {
        schools.push({
            id: new URLSearchParams(
                school.href.substring(school.href.indexOf('?'))
            ).get('school_id'),
            name: school.innerHTML,
        });
    }

    return schools;
}

async function promptSchoolList(schools) {
    return (
        await inquirer.prompt([
            {
                type: 'list',
                name: 'school',
                message: '学校を選択',
                choices: schools.map((v) => ({
                    name: `${v.name}(${v.id})`,
                    value: v,
                })),
            },
        ])
    ).school;
}

module.exports = { fetchSchoolList, promptSchoolList };
