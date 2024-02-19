const { publicSubjects } = require('./syllabusUrl');
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const inquirer = require('inquirer');

async function fetchYearList(schoolId, departmentId) {
    const url = new URL(publicSubjects);
    const query = url.searchParams;
    query.set('school_id', schoolId);
    query.set('department_id', departmentId);
    const htmlRaw = await axios.get(url.toString());
    const dom = new JSDOM(htmlRaw.data);

    const dropDownMenuCandidates =
        dom.window.document.querySelectorAll('ul.dropdown-menu');
    const dropDownMenu = [...dropDownMenuCandidates].find((ul) =>
        [...ul.querySelectorAll('a')].some(
            (a) => a.href.indexOf('PublicSubjects') !== -1
        )
    );
    const links = dropDownMenu.querySelectorAll('li');

    const years = [];
    for (const year of links) {
        const link = year.querySelector('a').href;
        years.push({
            id: new URLSearchParams(link.substring(link.indexOf('?'))).get(
                'year'
            ),
            name: year.querySelector('a').innerHTML.trim(),
        });
    }

    return years;
}

async function promptYearList(departments) {
    return (
        await inquirer.prompt([
            {
                type: 'list',
                name: 'year',
                message: '年度を選択（入学年度ではなくその学年の年度）',
                choices: departments.map((v) => ({
                    name: `${v.name}(${v.id})`,
                    value: v,
                })),
            },
        ])
    ).year;
}

module.exports = {
    fetchYearList,
    promptYearList,
};
