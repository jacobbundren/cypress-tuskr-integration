describe("Section 1 Tests", () => {
    it("Cypress-Tuskr-Test-1", () => {
        cy.visit("www.google.com");
        cy.url().should("contain", "google.com");
    });
    it("Cypress-Tuskr-Test-2", () => {
        cy.visit("www.google.com");
        cy.url().should("contain", "google.coma");
    });
});