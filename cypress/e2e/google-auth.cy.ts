/// <reference types="cypress" />

describe('Google Authentication', () => {
  it('should attempt to sign in with Google', () => {
    // Visit the page where the auth form is located
    cy.visit('/');

    // Click the button that opens the sign-in dialog
    cy.get('[data-cy="user-button"]').click();
    cy.log('User button clicked');

    // Click the Google Sign-In button, waiting up to 10 seconds for it to appear
    cy.get('button:contains("Google")', { timeout: 10000 }).should('be.visible').click();

    // At this point, the test will likely fail or hang because of the redirect to Google.
    // This is expected. The goal of this test is to quickly trigger the flow
    // for debugging, not to complete the entire OAuth process within Cypress.
  });
});
