'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const modalAdd = document.querySelector('#modal-add'),
          modalChange = document.querySelector('#modal-change'),
          modalDelete = document.querySelector('#modal-delete');

    function openModal(modal) {
        modal.classList.add('is-open-modal');
        modal.querySelector('.modal__content').classList.add('modal-open');
    }

    function closeModal(modal) {
        modal.classList.remove('is-open-modal');
        modal.querySelector('.modal__content').classList.remove('modal-open');
    }

    document.querySelector('.add-client-btn').addEventListener('click', () => {
        openModal(modalAdd);
    });

    modalAdd.addEventListener('click', e => {
        const event = e.target;
        if (event === modalAdd ||
            event.closest('.close-btn') ||
            event.closest('.cansel-btn')) {
            closeModal(modalAdd);
        }
    });
});
