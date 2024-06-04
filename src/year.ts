import { publicSubjects } from './syllabusUrl';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import inquirer from 'inquirer';
import { Department, Year } from './types';

async function fetchYearList(schoolId: string, departmentId: string): Promise<Year[]> {
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
    if (!dropDownMenu) {
        throw new Error('Failed to found dropdown menu.');
    }
    const links = dropDownMenu.querySelectorAll('li');

    const years = [];
    for (const year of links) {
        const element = year.querySelector('a');
        if (!element) {
            continue;
        }

        const nameElement = year.querySelector('a');
        if (!nameElement) {
            continue;
        }
        const link = element.href;

        const id = new URLSearchParams(link.substring(link.indexOf('?'))).get(
            'year'
        );

        if (!id) {
            continue;
        }

        years.push({
            id,
            name: nameElement.innerHTML.trim()
        });
    }

    return years;
}

async function promptYearList(departments: Department[]) {
    return (
        await inquirer.prompt([
            {
                type: 'list',
                name: 'year',
                message: '年度を選択（学年の年度）',
                choices: departments.map((v) => ({
                    name: `${v.name}(${v.id})`,
                    value: v
                }))
            }
        ])
    ).year;
}

export {
    fetchYearList,
    promptYearList
};
