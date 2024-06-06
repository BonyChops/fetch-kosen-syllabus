import { publicDepartmentsUrls } from './syllabusUrl';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import inquirer from 'inquirer';
import { Department } from './types';

async function fetchDepartmentList(schoolId: string): Promise<Department[]> {
    const url = new URL(publicDepartmentsUrls);
    const query = url.searchParams;
    query.set('school_id', schoolId);
    const htmlRaw = await axios.get(url.toString());
    const dom = new JSDOM(htmlRaw.data);
    const { HTMLAnchorElement } = dom.window;

    const departmentList =
        dom.window.document.querySelectorAll('.panel-body .row');
    const departments = [];
    for (const department of departmentList) {
        const element = department.querySelector('a.btn.btn-primary.btn-sm');
        if (!element || !(element instanceof HTMLAnchorElement)) {
            continue;
        }
        const link = element?.href;

        const nameElement = department.querySelector(
            'h4.list-group-item-heading',
        );
        if (!nameElement) {
            continue;
        }

        const id = new URLSearchParams(link.substring(link.indexOf('?'))).get(
            'department_id',
        );

        if (!id) {
            continue;
        }

        departments.push({
            id,
            name: nameElement.innerHTML.trim(),
        });
    }

    return departments;
}

async function promptDepartmentList(departments: Department[]) {
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

export { fetchDepartmentList, promptDepartmentList };
