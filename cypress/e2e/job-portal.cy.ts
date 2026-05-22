describe("JobWest portal", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");
  });

  it("loads listings and opens a job detail", () => {
    cy.contains("h1", "Vyberte si krajinu").should("be.visible");
    cy.get("[data-cy=job-search]:visible")
      .should("be.visible")
      .and("have.attr", "placeholder", "Hľadať pozíciu, firmu, krajinu...");
    cy.contains("Odporúčané ponuky").should("not.exist");

    cy.get("[data-cy=job-card]").should("have.length.greaterThan", 0);
    cy.get("[data-cy=job-card-title]")
      .first()
      .invoke("text")
      .then((title) => {
        const firstTitle = title.trim();

        cy.get("[data-cy=job-card-title]").first().click();
        cy.location("pathname").should("match", /^\/ponuky\/[^/]+$/);
        cy.contains("h1", firstTitle).should("be.visible");
        cy.contains("Popis ponuky").should("be.visible");
        cy.contains("Kontaktné informácie").should("be.visible");
        cy.contains("jobs@westwerk.example").should("be.visible");

        cy.contains("a", "Späť na zoznam ponúk").click();
        cy.location("pathname").should("eq", "/");
        cy.get("[data-cy=job-card]").should("have.length.greaterThan", 0);
      });
  });

  it("hides placeholder jobs from public listings", () => {
    cy.contains("[data-cy=job-card-title]", /^blabla$/i).should("not.exist");
    cy.contains("[data-cy=job-card-title]", /^test$/i).should("not.exist");
  });

  it("keeps the mobile layout inside the viewport", () => {
    const viewportWidth = 390;

    cy.viewport(viewportWidth, 932);
    cy.visit("/");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");
    cy.get("[data-cy=user-button]").should("be.visible");
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.be.lte(win.innerWidth);
    });
    cy.get("[data-cy=user-button]").then(($button) => {
      const rect = $button[0].getBoundingClientRect();

      expect(rect.left).to.be.gte(0);
      expect(rect.right).to.be.lte(viewportWidth);
    });
  });

  it("shows an empty state for unmatched search and resets filters", () => {
    cy.get("[data-cy=job-card]").should("have.length.greaterThan", 0);

    cy.get("[data-cy=job-search]:visible").type("jobwest-unmatched-search-000");
    cy.contains("Žiadne ponuky").should("be.visible");
    cy.contains("Nenašli sme žiadne ponuky").should("be.visible");

    cy.contains("button", "Resetovať filtre").click();
    cy.get("[data-cy=job-search]:visible").should("have.value", "");
    cy.get("[data-cy=job-card]").should("have.length.greaterThan", 0);
  });

  it("reveals pricing information", () => {
    cy.get("[data-cy=pricing-info-toggle]:visible").click();

    cy.get("[data-cy=pricing-info-panel]").within(() => {
      cy.contains("Pridanie inzerátu").should("be.visible");
      cy.contains("TOP zvýraznenie").should("be.visible");
      cy.contains("Exclusive zvýraznenie").should("be.visible");
    });
  });

  it("shows stronger job card actions, salary clarity, and local saved jobs", () => {
    cy.get("[data-cy=job-card]").first().as("firstCard");

    cy.get("@firstCard").within(() => {
      cy.contains("Zobraziť ponuku").should("be.visible");
      cy.get("[data-cy=salary-clarity]").should("be.visible");
      cy.get("[data-cy=job-trust-badge]").should("have.length.greaterThan", 0);
      cy.get("[data-cy=save-job-button]").click();
    });

    cy.contains("Pracovná ponuka uložená").should("be.visible");
    cy.reload();
    cy.get("[data-cy=job-card]")
      .first()
      .find("[data-cy=save-job-button]")
      .should("have.attr", "aria-pressed", "true");
  });

  it("filters jobs by salary, language, highlight tier, and accommodation", () => {
    cy.get("#desktop-salary-min-filter").scrollIntoView().clear();
    cy.get("#desktop-salary-min-filter").type("5000");
    cy.contains("[data-cy=job-card-title]", "Senior elektrikár").should("be.visible");
    cy.contains("[data-cy=job-card-title]", "Hotelový recepčný").should("not.exist");

    cy.contains("button", "Resetovať filtre").click();
    cy.get("[data-cy=language-filter-nemcina]").click();
    cy.contains("[data-cy=job-card-title]", "Hotelový recepčný").should("be.visible");
    cy.contains("[data-cy=job-card-title]", "Frontend developer").should("not.exist");

    cy.contains("button", "Resetovať filtre").click();
    cy.get("[data-cy=highlight-filter-exclusive]").click();
    cy.get("[data-cy=job-card]").should("have.length.greaterThan", 0);
    cy.get("[data-cy=job-card]").each(($card) => {
      cy.wrap($card).contains("Exclusive").should("be.visible");
    });

    cy.contains("button", "Resetovať filtre").click();
    cy.get("[data-cy=accommodation-filter]").click();
    cy.get("[data-cy=job-card]").first().contains("Ubytovanie").should("be.visible");
  });

  it("links each job to a clean detail URL and handles JobPosting schema honestly", () => {
    cy.get("[data-cy=job-detail-link]")
      .first()
      .invoke("attr", "href")
      .then((href) => {
        const jobHref = href ?? "";

        expect(jobHref).to.match(/^\/ponuky\/[^/]+$/);
        cy.visit(jobHref);
      });

    cy.location("pathname").should("match", /^\/ponuky\/[^/]+$/);
    cy.contains("h1", "Zvárač MIG/MAG").should("be.visible");

    cy.get("body").then(($body) => {
      const isDemoMode = $body.find("[data-cy=demo-data-warning]").length > 0;
      const graphs = [...$body.find('script[type="application/ld+json"]')]
        .map((script) => JSON.parse(script.textContent || "{}"))
        .flatMap((entry) => entry["@graph"] || [entry]);
      const posting = graphs.find((entry) => entry["@type"] === "JobPosting");

      if (isDemoMode) {
        expect(posting, "demo detail must not expose JobPosting schema").to.not.exist;
      } else {
        expect(posting, "JobPosting schema").to.exist;
        expect(posting.url).to.match(/\/ponuky\//);
        expect(posting.baseSalary.value.unitText).to.be.oneOf(["HOUR", "MONTH"]);
      }
    });
  });

  it("keeps JobPosting schema only on detail pages and exposes country pages", () => {
    cy.get('script[type="application/ld+json"]').then(($scripts) => {
      const graphs = [...$scripts]
        .map((script) => JSON.parse(script.textContent || "{}"))
        .flatMap((entry) => entry["@graph"] || [entry]);

      expect(graphs.some((entry) => entry["@type"] === "JobPosting")).to.eq(false);
    });

    cy.visit("/krajiny/de");
    cy.contains("h1", "Práca v Nemecku").should("be.visible");
    cy.contains("aktuálnych ponúk").should("be.visible");
    cy.get("body").then(($body) => {
      const isDemoMode = $body.find("[data-cy=demo-data-warning]").length > 0;
      const entries = [...$body.find('script[type="application/ld+json"]')]
        .map((script) => JSON.parse(script.textContent || "{}"));

      expect(entries.some((entry) => entry["@type"] === "ItemList")).to.eq(!isDemoMode);
      expect(entries.some((entry) => entry["@type"] === "JobPosting")).to.eq(false);
    });
  });

  it("opens public index routes from the desktop navigation", () => {
    cy.viewport(1280, 900);

    cy.contains("nav a", "Ponuky").click();
    cy.location("pathname").should("eq", "/ponuky");
    cy.contains("h1", "Pracovné ponuky v zahraničí").should("be.visible");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");

    cy.contains("nav a", "Krajiny").click();
    cy.location("pathname").should("eq", "/krajiny");
    cy.contains("h1", "Práca podľa krajiny").should("be.visible");
    cy.contains("a", "Nemecko").should("have.attr", "href", "/krajiny/de");
  });

  it("serves sitemap, robots, and canonical URLs for search engines", () => {
    cy.get('link[rel="canonical"]').should("have.attr", "href", "https://jobwest.sk");

    cy.get("body").then(($body) => {
      const isDemoMode = $body.find("[data-cy=demo-data-warning]").length > 0;

      cy.request("/sitemap.xml").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include("https://jobwest.sk/ponuky");
        expect(response.body).to.include("https://jobwest.sk/krajiny");
        expect(response.body).to.include("https://jobwest.sk/obchodne-podmienky");
        expect(response.body).to.include("https://jobwest.sk/ochrana-sukromia");

        if (isDemoMode) {
          expect(response.body).not.to.include("https://jobwest.sk/ponuky/");
          expect(response.body).not.to.include("https://jobwest.sk/krajiny/");
        } else {
          expect(response.body).to.include("https://jobwest.sk/ponuky/");
          expect(response.body).to.include("https://jobwest.sk/krajiny/");
        }
      });
    });

    cy.request("/robots.txt").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.include("Allow: /");
      expect(response.body).to.include("Disallow: /ucet");
      expect(response.body).to.include("Disallow: /admin");
      expect(response.body).to.include("Sitemap: https://jobwest.sk/sitemap.xml");
    });
  });

  it("opens the auth modal from the account button", () => {
    cy.get("[data-cy=user-button]").click();
    cy.contains("Účet JobWest").should("be.visible");
    cy.contains("Pokračovať cez Google").should("be.visible");
    cy.get("input[name=email]").should("be.visible");
    cy.get("input[name=password]").should("be.visible");
  });

  it("opens the add-ad auth modal from the employer CTA", () => {
    cy.get("[data-cy=employer-add-ad-button]:visible").first().click();
    cy.get("[role=dialog]").within(() => {
      cy.contains("Účet JobWest").should("be.visible");
      cy.contains("Prihlásenie pre pridanie a správu inzerátov.").should("be.visible");
      cy.contains("button", "Prihlásiť sa").should("be.visible");
    });
  });

  it("redirects signed-out users away from the dashboard", () => {
    cy.visit("/ucet");
    cy.location("pathname").should("eq", "/");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");
  });

  it("redirects signed-out users away from the add-ad page", () => {
    cy.visit("/ucet/pridat-inzerat");
    cy.location("pathname").should("eq", "/");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");
  });

  it("redirects signed-out users away from the edit-ad page", () => {
    cy.visit("/ucet/inzerat/1/upravit");
    cy.location("pathname").should("eq", "/");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");
  });

  it("redirects signed-out users away from the admin dashboard", () => {
    cy.visit("/admin");
    cy.location("pathname").should("eq", "/");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");
  });

  it("keeps mobile filters sticky and salary visible on compact cards", () => {
    cy.viewport(430, 932);
    cy.visit("/");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");

    cy.get("#ponuky").scrollIntoView();
    cy.get("[data-cy=mobile-filter-bar]").should("be.visible");
    cy.get("[data-cy=job-card]").first().within(() => {
      cy.get("[data-cy=salary-clarity]").should("be.visible");
      cy.contains("Zobraziť ponuku").should("be.visible");
    });
  });

  it("applies sorting and filters immediately on mobile", () => {
    cy.viewport(430, 932);
    cy.visit("/");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");

    cy.get("#ponuky").scrollIntoView();
    cy.get("[data-cy=sort-select]:visible").select("salary-desc");
    cy.contains("Zoradené: Najvyššia mzda").should("be.visible");

    cy.get("[data-cy=mobile-filter-bar]:visible button").first().click();
    cy.contains("Filtre otvorené").should("be.visible");
    cy.get("#mobile-salary-min-filter").clear();
    cy.get("#mobile-salary-min-filter").type("5000");
    cy.contains("[data-cy=job-card-title]", "Senior elektrikár").should("be.visible");
    cy.get("[data-cy=accommodation-filter]:visible").click();
    cy.contains("Filter ubytovania bol použitý").should("be.visible");
    cy.contains("button", /^Zobraziť výsledky/).click();
    cy.contains("Zobrazených").should("be.visible");
    cy.contains("[data-cy=job-card-title]", "Senior elektrikár").should("be.visible");
  });

  it("keeps form control ids unique when mobile filters are open", () => {
    cy.viewport(430, 932);
    cy.visit("/");
    cy.get("[data-cy=job-portal]").should("have.attr", "data-ready", "true");
    cy.get("#ponuky").scrollIntoView();
    cy.get("[data-cy=mobile-filter-bar]:visible button").first().click();

    cy.get("[id]").then(($nodes) => {
      const ids = [...$nodes].map((node) => node.id).filter(Boolean);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

      expect(duplicates).to.deep.equal([]);
    });

    cy.get("input, select, textarea").filter(":visible").each(($field) => {
      const id = $field.attr("id");
      const name = $field.attr("name");
      const ariaLabel = $field.attr("aria-label");

      expect(id || name || ariaLabel, "field identity").to.be.a("string").and.not.be.empty;
    });
  });
});
