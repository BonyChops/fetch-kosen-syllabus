const { publicDepartmentsUrls } = require('./syllabusUrl');
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const inquirer = require('inquirer');

async function fetchDepartmentList(schoolId) {
    const url = new URL(publicDepartmentsUrls);
    const query = url.searchParams;
    query.set('school_id', schoolId);
    const htmlRaw = await axios.get(url.toString());
    const dom = new JSDOM(htmlRaw.data);

    const departmentList =
        dom.window.document.querySelectorAll('.panel-body .row');
    const departments = [];
    for (const department of departmentList) {
        const link = department.querySelector('a.btn.btn-primary.btn-sm').href;
        departments.push({
            id: new URLSearchParams(link.substring(link.indexOf('?'))).get(
                'department_id'
            ),
            name: department
                .querySelector('h4.list-group-item-heading')
                .innerHTML.trim(),
        });
    }

    return departments;
}

async function promptDepartmentList(departments) {
    return (
        await inquirer.prompt([
            {
                type: 'list',
                name: 'department',
                message: '学科を選択',
                choices: departments.map((v) => ({
                    name: `${v.name}(${v.id})`,
                    value: v,
                })),
            },
        ])
    ).department;
}

module.exports = {
    fetchDepartmentList,
    promptDepartmentList,
};
