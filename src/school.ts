import { publicSchoolsUrl } from './syllabusUrl';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import inquirer from 'inquirer';
import { School } from './types';

async function fetchSchoolList(): Promise<School[]> {
    const htmlRaw = await axios.get(publicSchoolsUrl);
    const dom = new JSDOM(htmlRaw.data);
    const { HTMLAnchorElement } = dom.window;

    const schoolList = dom.window.document.querySelectorAll(
        'table.school_table a.link_button.btn.btn-default'
    );
    const schools = [];
    for (const school of schoolList) {
        if (!(school instanceof HTMLAnchorElement)) {
            continue;
        }

        const id = new URLSearchParams(
            school.href.substring(school.href.indexOf('?'))
        ).get('school_id');

        if (!id) {
            continue;
        }

        schools.push({
            id,
            name: school.innerHTML
        });
    }

    return schools;
}

async function promptSchoolList(schools: School[]) {
    return (
        await inquirer.prompt([
            {
                type: 'list',
                name: 'school',
                message: '学校を選択',
                choices: schools.map((v) => ({
                    name: `${v.name}(${v.id})`,
                    value: v
                }))
            }
        ])
    ).school;
}

export { fetchSchoolList, promptSchoolList };
