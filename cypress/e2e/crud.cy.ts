describe('Kanban Board CRUD', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.removeItem('kanban-board-storage');
      },
    });
    cy.contains('To Do').should('be.visible');
  });

  describe('Read', () => {
    it('displays all kanban columns', () => {
      cy.contains('To Do').should('exist');
      cy.contains('Doing').should('exist');
      cy.contains('Review').should('exist');
      cy.contains('Done').should('exist');
      cy.contains('Rework').should('exist');
    });

    it('displays initial tasks across columns', () => {
      cy.contains('Research for a podcast and video website').should('exist');
      cy.contains('Debug checkout process for the e-commerce website').should('exist');
      cy.contains('Design wireframes for the landing page revamp').should('exist');
      cy.contains('Create and refine logo designs for the UI brand').should('exist');
      cy.contains('Create the Email Page layout and necessary components').should('exist');
      cy.contains('Blog Edit Page Modification and Playlist Page Design').should('exist');
    });

    it('opens task detail modal on card click', () => {
      cy.contains('Research for a podcast and video website').click();

      cy.get('ion-modal').should('exist');
      cy.contains('Description').should('exist');
      cy.contains('Check List').should('exist');
      cy.contains('Competitor analysis').should('exist');
    });
  });

  describe('Create', () => {
    it('creates a new task via the column add button', () => {
      const newTaskTitle = 'Cypress Test Task ' + Date.now();

      cy.contains('To Do')
        .parent()
        .find('button')
        .first()
        .click();

      cy.contains('Create Task').should('exist');

      cy.get('input[placeholder="Enter task title"]').type(newTaskTitle, { force: true });
      cy.get('textarea[placeholder="Enter task description"]').type(
        'This is a test task created by Cypress',
        { force: true }
      );

      cy.get('select').then(($selects) => {
        const labelSelect = [...$selects].find((s) =>
          [...s.options].some((o) => o.value === 'Bug')
        );
        if (labelSelect) cy.wrap(labelSelect).select('Bug', { force: true });
      });

      cy.get('select').then(($selects) => {
        const prioritySelect = [...$selects].find((s) =>
          [...s.options].some((o) => o.value === 'High')
        );
        if (prioritySelect) cy.wrap(prioritySelect).select('High', { force: true });
      });

      cy.contains('button', 'Save').scrollIntoView().click({ force: true });

      cy.contains(newTaskTitle).should('exist');
    });

    it('validates that title is required', () => {
      cy.contains('To Do')
        .parent()
        .find('button')
        .first()
        .click();

      cy.contains('Create Task').should('exist');
      cy.contains('button', 'Save').scrollIntoView().click({ force: true });
      cy.contains('Title is required').should('exist');
    });

    it('can discard task creation', () => {
      cy.contains('To Do')
        .parent()
        .find('button')
        .first()
        .click();

      cy.contains('Create Task').should('exist');
      cy.contains('button', 'Discard').scrollIntoView().click({ force: true });
      cy.contains('Create Task').should('not.exist');
    });
  });

  describe('Update', () => {
    it('edits a task title and description', () => {
      const updatedSuffix = ' - Updated ' + Date.now();

      cy.contains('Research for a podcast and video website').click();

      cy.get('ion-modal').should('exist');
      cy.wait(500);

      cy.contains('h2', 'Research for a podcast and video website')
        .parent()
        .find('button')
        .click({ force: true });

      cy.contains('Edit Task').should('exist');
      cy.wait(300);

      cy.get('input[placeholder="Enter task title"]')
        .clear({ force: true })
        .type('Updated Research Task' + updatedSuffix, { force: true });

      cy.get('textarea[placeholder="Enter task description"]')
        .clear({ force: true })
        .type('Updated description by Cypress', { force: true });

      cy.contains('button', 'Save').scrollIntoView().click({ force: true });

      cy.contains('Updated Research Task' + updatedSuffix).should('exist');
    });

    it('edits task label and priority', () => {
      cy.contains('Create modern living room interior concept').click();

      cy.get('ion-modal').should('exist');
      cy.wait(500);

      cy.contains('h2', 'Create modern living room interior concept')
        .parent()
        .find('button')
        .click({ force: true });

      cy.contains('Edit Task').should('exist');
      cy.wait(300);

      cy.get('select').then(($selects) => {
        const labelSelect = [...$selects].find((s) =>
          [...s.options].some((o) => o.value === 'Bug')
        );
        if (labelSelect) cy.wrap(labelSelect).select('Bug', { force: true });
      });

      cy.get('select').then(($selects) => {
        const prioritySelect = [...$selects].find((s) =>
          [...s.options].some((o) => o.value === 'Critical')
        );
        if (prioritySelect) cy.wrap(prioritySelect).select('Critical', { force: true });
      });

      cy.contains('button', 'Save').scrollIntoView().click({ force: true });

      cy.contains('Create modern living room interior concept')
        .closest('[class*="rounded-2xl"]')
        .within(() => {
          cy.contains('Bug').should('exist');
        });
    });
  });

  describe('Delete', () => {
    it('deletes a task via the detail modal delete button', () => {
      const taskToDelete = 'Research for a podcast and video website';

      cy.contains(taskToDelete).should('exist');
      cy.contains(taskToDelete).click();

      cy.contains('Mark Complete').should('be.visible');
      cy.wait(500);

      cy.get('ion-footer button').contains('Delete').should('be.visible').click();

      cy.get('ion-alert:not(.overlay-hidden)', { timeout: 5000 }).should('exist');

      cy.get('ion-alert:not(.overlay-hidden) button.alert-button-role-destructive')
        .click({ force: true });

      cy.wait(1000);
      cy.contains(taskToDelete).should('not.exist');
    });
  });

  describe('Search', () => {
    it('filters tasks by search query', () => {
      cy.get('input[placeholder="Search Tasks"]').first().type('Debug checkout');

      cy.contains('Debug checkout process for the e-commerce website').should('exist');
      cy.contains('Research for a podcast and video website').should('not.exist');
    });

    it('clears search to show all tasks again', () => {
      cy.get('input[placeholder="Search Tasks"]').first().type('Debug checkout');

      cy.contains('Debug checkout process for the e-commerce website').should('exist');

      cy.get('input[placeholder="Search Tasks"]').first().clear();
      cy.wait(500);

      cy.contains('Research for a podcast and video website').should('exist');
      cy.contains('Debug checkout process for the e-commerce website').should('exist');
    });
  });
});
