'use strict';

window.addEventListener('DOMContentLoaded', () => {
    function renderElement(element, parent) {
        parent.append(element);
    }
    
    function createElement(name, parent, text = '', classesEl = []) {
        const element = document.createElement(name);
        if (classesEl.length) {
        element.classList.add(...classesEl);
        }
        if(text) {
        element.textContent = text;
        }
        renderElement(element, parent);
        return element;
    }

    async function getData(url) {
        const result = await fetch(url);
        if (!result.ok) {
            throw new Error(`Could not fetch ${url}, status ${result.status}`);
        }
        return result.json();
    }

    async function postData(url, data) {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await result.json();
    }

    async function changeData(url, obj) {
        const result = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        });
        return await result.json();
    }

    async function deleteData(url) {
        const result = await fetch(url, {
            method: 'DELETE'
        });
        if (!result.ok) {
            throw new Error(`Could not fetch ${url}, status ${result.status}`);
        }
        return result.json();
    }

    function addCapitalLetter(value) {
        return value[0].toUpperCase() + value.slice(1).toLowerCase();
    }

    function addFullName(obj) {
        obj.fullName = `${obj.surname} ${obj.name} ${obj.lastName}`.trim();
    }

    function convertToDateObj(value) {
        return new Date(value);
    }

    function getDateAndTime(dateObj) {
        return {
            date: dateObj.toLocaleDateString(),
            time: dateObj.toLocaleTimeString().slice(0, 5)
        };
    }

    function convertDataValues(arr) {
        arr.forEach(item => {
            addFullName(item);
            item.id = +item.id;
            item.createdAt = convertToDateObj(item.createdAt);
            item.updatedAt = convertToDateObj(item.updatedAt);
            item.created = getDateAndTime(item.createdAt);
            item.updated = getDateAndTime(item.updatedAt);
        });
    }

    function renderContacts(arr, parent) {
        arr.forEach(contact => {
            let contactType = null,
                contactTypeLink = '',
                targetBlank = '_blank';

            switch (contact.type) {
                case 'Телефон':
                    contactType = 'client__contact-link--phone';
                    contactTypeLink = 'tel:';
                    targetBlank = '';
                    break;
                case 'Email':
                    contactType = 'client__contact-link--mail';
                    contactTypeLink = 'mailto:';
                    targetBlank = ' ';
                    break;
                case 'Vk':
                    contactType = 'client__contact-link--vk';
                    break;
                case 'Facebook':
                    contactType = 'client__contact-link--fb';
                    break;
                case 'Другое':
                    contactType = 'client__contact-link--other';
                    break;

                default:
                    break;
            }

            const contactEl = createElement(
                'li', parent, '', ['client__contact']
            ),
                contactLink = createElement(
                'a',
                contactEl,
                '',
                ['link', 'client__contact-link', contactType]
            ),
                contactTooltipLink = `${contactTypeLink}${contact.value}`;

            contactLink.href = contactTooltipLink;
            contactLink.ariaLabel = `Тип контакта: ${contact.type}`;
            if (targetBlank) {
                contactLink.target = targetBlank;
                contactLink.rel = 'nofollow noopener noreferrer';
            }

            tippy(contactLink, {
                content: 
                    `<span class='tooltip__type-text'>
                        ${contact.type}:
                    </span>
                    <a class='link tooltip__link'
                        href='${contactTooltipLink}'
                        target='${targetBlank}'
                        rel='nofollow noopener noreferrer'>
                        ${contact.value}
                    </a>`,
                allowHTML: true,
                theme: 'mine-shaft',
                interactive: true,
            });
        });
    }

    function getFormElements(form) {
        currentModalFormElements = form.dataset.target !== 'delete-client' ?
            {
                form: form,
                inputsForm: form.querySelectorAll('.modal-form__input'),
                addContactsForm: form.querySelector(
                    '.modal-form__add-contacts'
                ),
                contactsContainerForm: form.querySelector(
                    '.modal-form__contacts-container'
                ),
                addContactBtn: form.querySelector('.add-contact-btn'),
                errorsForm: form.querySelector('.modal-form__errors-box'),
                acceptFormBtn: form.querySelector('.accept-btn')
            } :
            {
                form: form,
                errorsForm: form.querySelector('.modal-form__errors-box'),
                acceptFormBtn: form.querySelector('.accept-btn')
            };
    }

    function formReset() {
        const {
            form,
            contactsContainerForm,
            addContactsForm,
            addContactBtn,
            errorsForm,
            inputsForm
            } = currentModalFormElements;

        errorsForm.innerHTML = '';

        if (form.dataset.target !== 'delete-client') {
            form.reset();
            contactsContainerForm.innerHTML = '';
            contactsContainerForm.classList.remove(
                'modal-form__contacts-container--margin-bottom'
            );
            addContactsForm.classList.remove(
                'modal-form__add-contacts--large-padding'
            );
            addContactBtn.classList.remove('hide');
            inputsForm.forEach(input => {
                input.classList.remove('modal-form__input--error');
                input.nextElementSibling.classList.remove(
                    'modal-form__placeholder--small'
                );
            });
        }
    }

    function fillForm() {
        const {
            inputsForm,
            contactsContainerForm,
            errorsForm
            } = currentModalFormElements;
        
        getData(`${prefixUri}/${currentClientId}`)
            .then(data => {                
                inputsForm.forEach(input => {
                    input.nextElementSibling.classList.add(
                        'modal-form__placeholder--small'
                    );
                    input.value = data[input.name];
                });
                
                data.contacts.forEach(contact => {
                    createContactInput(
                        contactsContainerForm,
                        contact.type,
                        contact.value
                    );
                });
            })
            .catch(() => {
                createElement(
                    'span',
                    errorsForm,
                    'Клиент удален или ошибка сервера'
                );
                setTimeout(() => {
                    closeModal();
                    renderTable();
                }, 3000);
            });
    }

    function openModal(path) {
        modalForms.forEach(form => {
            if (form.dataset.target === path) {
                getFormElements(form);
                if (path === 'change-client') {
                    fillForm();
                }
                form.classList.add('show');
                modal.classList.add('is-open-modal');
                modalContent.classList.add('modal-open');
                setTimeout(() =>
                    modalContent.classList.add('animate-open'),
                    300
                );
                return;
            }
        });
        
    }

    function closeModal() {
        modal.classList.remove('is-open-modal');
        modalContent.classList.remove('modal-open', 'animate-open');
        modalForms.forEach(form => form.classList.remove('show'));
        formReset();
    }

    function createContactInput (parent, type= '', value='') {
        const options = [
                {
                    value: 'Телефон',
                    label: 'Телефон',
                },
                {
                    value: 'Email',
                    label: 'Email',
                },
                {
                    value: 'Vk',
                    label: 'Vk',
                },
                {
                    value: 'Facebook',
                    label: 'Facebook',
                },
                {
                    value: 'Другое',
                    label: 'Другое',
                }
            ],
            contact = createElement('div', parent, '', ['contact']);

        contact.innerHTML =`
            <select class="contact__select"></select>
            <input
                class="contact__input"
                type="text"
                value="${value}"
                placeholder="Введите данные контакта"
            >
            <button class="btn-reset contact__delete-btn"
                type="button"
                aria-label="Удалить контакт"
            >
                <svg
                    class="contact__svg-delete"
                    width="12" height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6
                        12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6
                        10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354
                        1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646
                        8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3
                        3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9
                        8.154L6.846 6L9 3.846L8.154 3Z"
                    />
                </svg>                                    
            </button>
        `;

        tippy(contact.querySelector('.contact__delete-btn'), {
            content: 'Удалить контакт',
            theme: 'mine-shaft',
            offset: [0, -1]
        });

        if (type) {
            options.forEach(option => {
                if (option.value === type) {
                    option.selected = true;
                }
            });
        }

        new Choices(contact.querySelector('.contact__select'), {
            itemSelectText: '',
            searchEnabled: false,
            position: 'bottom',
            shouldSort: false,
            choices: options
        });

        setTimeout(() => contact.classList.add('animate-add'), 10);

        const {addContactsForm, addContactBtn} = currentModalFormElements;

        let amountImputs = parent.querySelectorAll('.contact').length;

        if (!addContactsForm.classList.contains(
                'modal-form__add-contacts--large-padding'
            )) {
            addContactsForm.classList.add(
                'modal-form__add-contacts--large-padding'
            );
        }
        
        if (!parent.classList.contains(
                'modal-form__contacts-container--margin-bottom'
            )) {
            parent.classList.add(
                'modal-form__contacts-container--margin-bottom'
            );
        }

        if (amountImputs >= 10) {
            addContactBtn.classList.add('hide');
            parent.classList.remove(
                'modal-form__contacts-container--margin-bottom'
            );
        }

        contact
            .querySelector('.contact__delete-btn')
            .addEventListener('click', () => {
                contact.classList.remove('animate-add');
                setTimeout(() => {
                    contact.remove();
                    amountImputs = parent.querySelectorAll('.contact').length;
                    if (!amountImputs) {
                        addContactsForm.classList.remove(
                            'modal-form__add-contacts--large-padding'
                        );
                        parent.classList.remove(
                            'modal-form__contacts-container--margin-bottom'
                        );
                    }
                    if (amountImputs < 10 &&
                        addContactBtn.classList.contains('hide')) {
                        addContactBtn.classList.remove('hide');
                        parent.classList.add(
                            'modal-form__contacts-container--margin-bottom'
                        );
                    }
                }, 350);
        });
    }

    function modalTrigger(parent, selector, clientId = null) {
        parent.querySelector(selector).addEventListener('click', e => {
            currentClientId = clientId ? clientId : null;
            openModal(e.currentTarget.dataset.path);
        });
    }

    function renderClient (obj, parent) {
        const client = createElement('tr', parent, '', ['client']);
        client.innerHTML =`
            <td class="table__client-cell client__id">${obj.id}</td>
            <td class="table__client-cell client__name">${obj.fullName}</td>
            <td class="table__client-cell client__creation">
                <span class="client__creation-date">${obj.created.date}</span>
                <span class="client__creation-time">${obj.created.time}</span>
            </td>
            <td class="table__client-cell client__change">
                <span class="client__change-date">${obj.updated.date}</span>
                <span class="client__change-time">${obj.updated.time}</span>
            </td>
            <td class="table__client-cell client__contacts">
                <ul class="client__contacts-list"></ul>
            </td>
            <td class="table__client-cell client__actions">
                <button class="client__change-btn btn-reset"
                        data-path="change-client">Изменить</button>
                <button class="client__delete-btn btn-reset"
                        data-path="delete-client">Удалить</button>
            </td>
        `;
        renderContacts(
            obj.contacts,
            client.querySelector('.client__contacts-list')
        );

        modalTrigger(client, '.client__change-btn', obj.id);
        modalTrigger(client, '.client__delete-btn', obj.id);
    }

    function renderTable() {
        let clientsList = [];
        tBody.innerHTML = '';

        getData(prefixUri)
            .then(data => {
                clientsList = [...data];
                convertDataValues(clientsList);
                clientsList = clientsList.sort((a, b) => {
                    const columnName = sortDirection.currentColumn,
                        direction = sortDirection.direction ?
                            a[columnName] < b[columnName] :
                            a[columnName] > b[columnName];
                    return direction ? -1 : 1;
                });
                clientsList.forEach(client => renderClient(client, tBody));
            })
            .catch(() => {
                const tr = createElement('tr', tBody);
                tr.innerHTML =
                    `
                    <td class="table__cell-error" colspan='6'>
                        Не удалось загрузить данные...
                    </td>
                    `;
            });
    }

    function processForm(hendler, uri) {
        const {
            contactsContainerForm,
            errorsForm,
            inputsForm,
            acceptFormBtn
            } = currentModalFormElements,
            contactsForm = contactsContainerForm.querySelectorAll('.contact'),
            clientObj = {};

        inputsForm.forEach(input => {
            let value = input.value.trim() ?
                addCapitalLetter(input.value).trim() :
                input.value;

            clientObj[input.name] = value;
        });
        clientObj.contacts = [];
        contactsForm.forEach(item => {
            const selectEl = item.querySelector('.contact__select'),
                inputEl = item.querySelector('.contact__input'),
                contactObj = {
                    type: selectEl.value,
                    value: inputEl.value
                };
            clientObj.contacts.push(contactObj);
        });

        hendler(uri, clientObj)
            .then((data) => {
                if (data.errors) {
                    data.errors.forEach(error => {
                    createElement('span', errorsForm, error.message);
                    inputsForm.forEach(input => {
                    if (input.name === error.field) {
                        input.classList.add('modal-form__input--error');
                    }
                    });
                });
                } else {
                    closeModal();
                    renderTable();
                }
            })
            .catch(() =>
                createElement('span', errorsForm, 'Что-то пошло не так')
            )
            .finally(() => {
                acceptFormBtn.classList.remove('accept-btn--load');
                acceptFormBtn.disabled = false;
            });
    }

    const prefixUri = 'http://localhost:3500/api/clients',
        tBody = document.querySelector('.table__body'),
        tHead = document.querySelector('.table__head'),
        columnNames = tHead.querySelectorAll('[data-column-name]'),
        modal = document.querySelector('.modal'),
        modalContent = modal.querySelector('.modal__content'),
        modalForms = modalContent.querySelectorAll('.modal-form'),
        sortDirection = {
            currentColumn: 'id',
            direction: true 
        };

    let currentModalFormElements = null,
        currentClientId = null;

    modal.addEventListener('click', e => {
        const event = e.target;

        if (event === modal ||
            event.closest('.close-btn') ||
            event.closest('.cansel-btn') ||
            event.closest('.delete-btn')) {
            closeModal();
        }

        if (event.closest('.delete-btn')) {
            openModal(event.dataset.path);
        }
    
        if (currentModalFormElements) {
            const {contactsContainerForm} = currentModalFormElements;
    
            if (event.closest('.add-contact-btn')) {
                createContactInput(contactsContainerForm);
            }
    
            if (event.closest('.choices')) {
                contactsContainerForm.querySelectorAll('.contact')
                    .forEach(contact =>
                        contact.classList.remove('contact--z-index'));
                event.closest('.contact').classList.add('contact--z-index');
            }
        }
    });

    modalContent.querySelectorAll('.modal-form__input').forEach(input =>
        input.addEventListener('change', () => {
            if (input.value) {
                input
                    .nextElementSibling
                    .classList.add('modal-form__placeholder--small');
            } else {
                input
                    .nextElementSibling
                    .classList.remove('modal-form__placeholder--small');
            }
        })
    );

    modalForms.forEach(modalForm => 
        modalForm.addEventListener('submit', e => {
            e.preventDefault();

            const {errorsForm, acceptFormBtn} = currentModalFormElements,
                currentForm = modalForm.dataset.target;

            errorsForm.innerHTML = '';
            acceptFormBtn.classList.add('accept-btn--load');
            acceptFormBtn.disabled = true;

            if (currentForm ==='add-client') {
                processForm(postData, prefixUri);
            }

            if (currentForm === 'change-client') {
                processForm(changeData, `${prefixUri}/${currentClientId}`);
            }

            if (currentForm === 'delete-client') {
                deleteData(`${prefixUri}/${currentClientId}`)
                    .then(() => {
                        closeModal();
                        renderTable();
                    })
                    .catch(() =>{
                        createElement(
                            'span',
                            errorsForm,
                            'Клиент удален или ошибка сервера'
                        );
                        setTimeout(() => {
                            closeModal();
                            renderTable();
                        }, 3000);
                    })
                    .finally(() => {
                        acceptFormBtn.classList.remove('accept-btn--load');
                        acceptFormBtn.disabled = false;
                    });
            }
        })
    );

    document.addEventListener('keydown', e => {
        if (e.code === 'Escape' && modal.classList.contains('is-open-modal')) {
            closeModal();
        }
    });

    tHead.addEventListener('mousedown', e => e.preventDefault());
    tHead.addEventListener('click', e => {
        if (e.target.closest('[data-column-name]')) {
            const currentColumn = e.target.dataset.columnName;
            if (sortDirection.currentColumn !== currentColumn) {
                sortDirection.currentColumn = currentColumn;
                sortDirection.direction = true;
                columnNames.forEach(item =>
                    item.classList.remove('table__head-text--up-arrow')
                );
                e.target.classList.add('table__head-text--up-arrow');
                renderTable();
            } else {
                sortDirection.direction = !sortDirection.direction;
                e.target.classList.toggle('table__head-text--up-arrow');
                renderTable();
            }
        }
    });
    
    modalTrigger(document, '.add-client-btn');
    renderTable();
});
