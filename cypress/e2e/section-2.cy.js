describe("Section 2 Tests", () => {
    it("Cypress-Tuskr-Test-3", () => {
        cy.visit("www.google.com");
        cy.url().should("contain", "google.com");
    });
});