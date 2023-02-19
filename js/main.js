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

    function openModal(modal) {
        const modalContent = modal.querySelector('.modal__content');
        modal.classList.add('is-open-modal');
        modalContent.classList.add('modal-open');
        setTimeout(() => modalContent.classList.add('animate-open'), 300);
    }

    function closeModal(modal) {
        modal.classList.remove('is-open-modal');
        modal.querySelector('.modal__content')
             .classList.remove('modal-open', 'animate-open');
        modal.querySelectorAll('.modal-form__placeholder--small')
             .forEach(placeholder =>
                 placeholder.classList.remove('modal-form__placeholder--small')
        );
    }

    function createContactInput (parent, showDeleteBtn = false) {
        const contact = createElement('div', parent, '', ['contact']);
        if (showDeleteBtn) {
            contact.classList.add('show-delete-btn');
        }
        contact.innerHTML =
            `
                <select class="contact__select">
                    <option value="Телефон">Телефон</option>
                    <option value="Email">Email</option>
                    <option value="Vk">Vk</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Другое">Другое</option>
                </select>
                <input
                    class="contact__input"
                    type="text"
                    placeholder="Введите данные контакта"
                >
                <button class="btn-reset contact__delete-btn" type="button">
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
        new Choices(contact.querySelector('.contact__select'), {
            itemSelectText: '',
            searchEnabled: false,
            position: 'bottom',
            shouldSort: false,
        });
        setTimeout(() => contact.classList.add('animate-add'), 10);
        contact.querySelector('.contact__delete-btn')
               .addEventListener('click', () => {
            contact.classList.remove('animate-add');
            setTimeout(() => {
                contact.remove();
                const amountImputs = contactsContainerFormAdd
                                    .querySelectorAll('.contact').length;
                if (!amountImputs) {
                    addContactsFormAdd.classList.remove(
                        'modal-form__add-contacts--large-padding'
                    );
                    contactsContainerFormAdd
                        .classList
                        .remove('modal-form__contacts-container--margin-bottom');
                }
                if (amountImputs < 10 &&
                    addContactBtn.classList.contains('hide')) {
                    addContactBtn.classList.remove('hide');
                    contactsContainerFormAdd
                        .classList
                        .add('modal-form__contacts-container--margin-bottom');
                }
            }, 350);
        });
    }

    function AddCapitalLetter(value) {
        return value[0].toUpperCase() + value.slice(1).toLowerCase();
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

    const modalAdd = document.querySelector('#modal-add'),
          formAdd = modalAdd.querySelector('.modal-form'),
          inputsFormAdd = formAdd.querySelectorAll('.modal-form__input'),
          addContactsFormAdd = formAdd.querySelector(
            '.modal-form__add-contacts'
          ),
          contactsContainerFormAdd = formAdd.querySelector(
              '.modal-form__contacts-container'
          ),
          addContactBtn = formAdd.querySelector('.add-contact-btn'),
          errorsFormAdd = formAdd.querySelector('.modal-form__errors-box'),
          acceptAddBtn = formAdd.querySelector('.accept-btn'),
          modalChange = document.querySelector('#modal-change'),
          modalDelete = document.querySelector('#modal-delete');

    document.querySelector('.add-client-btn').addEventListener('click', () => {
        openModal(modalAdd);
    });

    modalAdd.addEventListener('click', e => {
        const event = e.target;

        if (event === modalAdd ||
            event.closest('.close-btn') ||
            event.closest('.cansel-btn')) {
            closeModal(modalAdd);
            formAdd.reset();
            contactsContainerFormAdd.innerHTML = '';
            addContactsFormAdd
                .classList
                .remove('modal-form__add-contacts--large-padding');
            contactsContainerFormAdd
                .classList
                .remove('modal-form__contacts-container--margin-bottom');
            errorsFormAdd.innerHTML = '';
            inputsFormAdd.forEach(input =>
                input.classList.remove('modal-form__input--error')
            );
        }

        if (event.closest('.add-contact-btn')) {
            if (!addContactsFormAdd.classList
                    .contains('modal-form__add-contacts--large-padding')) {
                addContactsFormAdd.classList.add(
                    'modal-form__add-contacts--large-padding'
                );
            }
            if (!contactsContainerFormAdd.classList
                    .contains('modal-form__contacts-container--margin-bottom')) {
                contactsContainerFormAdd
                    .classList
                    .add('modal-form__contacts-container--margin-bottom');
            }

            createContactInput(contactsContainerFormAdd, true);

            if (contactsContainerFormAdd
                    .querySelectorAll('.contact').length >= 10) {
                addContactBtn.classList.add('hide');
                contactsContainerFormAdd
                    .classList
                    .remove('modal-form__contacts-container--margin-bottom');
            }
        }
    });

    document.querySelectorAll('.modal-form__input').forEach(input => {
        input.addEventListener('change', () => {
            if (input.value) {
                input.nextElementSibling
                     .classList.add('modal-form__placeholder--small');
            } else {
                input.nextElementSibling
                     .classList.remove('modal-form__placeholder--small');
            }
        });
    });

    formAdd.addEventListener('submit', e => {
        e.preventDefault();
        errorsFormAdd.innerHTML = '';
        acceptAddBtn.classList.add('accept-btn--load');
        acceptAddBtn.disabled = true;

        const formInputs = formAdd.querySelectorAll('.modal-form__input'),
              formContacts = formAdd.querySelectorAll('.contact'),
              newClient = {};
              formInputs.forEach(input => {
                  if (input.value.trim()) {
                      newClient[input.name] = AddCapitalLetter(input.value);
                  }
              });
        newClient.contacts = [];
        formContacts.forEach(item => {
            const selectEl = item.querySelector('.contact__select'),
                  inputEl = item.querySelector('.contact__input'),
                  contactObj = {
                      type: selectEl.value,
                      value: inputEl.value
                  };
            newClient.contacts.push(contactObj);
        });

        postData('http://localhost:3500/api/clients', newClient)
            .then((data) => {
                if (data.errors) {
                    data.errors.forEach(error => {
                        createElement('span', errorsFormAdd, error.message);
                        inputsFormAdd.forEach(input => {
                            if (input.name === error.field) {
                                input.classList.add('modal-form__input--error');
                            }
                        });
                    });
                } else {
                    formAdd.reset();
                    closeModal(modalAdd);
                }
            })
            .catch(() =>
                createElement('span', errorsFormAdd, 'Что-то пошло не так')
            )
            .finally(() => {
                acceptAddBtn.classList.remove('accept-btn--load');
                acceptAddBtn.disabled = false;
            });
    });
});
