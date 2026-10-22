# Relecture des textes « À comprendre » — 1.1.5

Le catalogue contenait 164 BT mais seulement 9 commentaires distincts, recopiés par groupe. Les 164 valeurs `notes` ont été remplacées par des explications propres à chaque champ. Les identifiants, libellés, catégories, groupes et statuts existants sont conservés. La numérotation du catalogue va de 1 à 165 sans BT-4.

Les textes sont des explications pédagogiques rédigées en français, et non une reproduction normative. Ils distinguent notamment les adresses électroniques des e-mails de contact, les identifiants légaux des numéros de TVA, les remises sur prix/des lignes/globales et les montants TTC/à payer.

## Références consultées le 22 octobre 2026

La documentation OpenPeppol ci-dessous permet de vérifier le sens des termes et les relations du socle. Les règles spécifiques Peppol, pays et cardinalités de son profil ne sont pas transposées automatiquement en obligations françaises. Les statuts du catalogue ne constituent pas une validation réglementaire exhaustive.

- [En-tête, références et structure UBL](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/)
- [Vendeur](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AccountingSupplierParty/cac-Party/)
- [Acheteur](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AccountingCustomerParty/cac-Party/)
- [Bénéficiaire](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-PayeeParty/)
- [Représentant fiscal](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-TaxRepresentativeParty/)
- [Livraison](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-Delivery/)
- [Paiement](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-PaymentMeans/)
- [Remises et frais](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AllowanceCharge/)
- [Totaux](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-LegalMonetaryTotal/)
- [Ventilation TVA](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-TaxTotal/cac-TaxSubtotal/)
- [Justificatifs](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AdditionalDocumentReference/)
- [Lignes](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoiceLine/)
- [Prix](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoiceLine/cac-Price/)
- [Articles](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoiceLine/cac-Item/)
- [BT-8 et exclusion mutuelle avec BT-7](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoicePeriod/cbc-DescriptionCode/)

## Vérification de la modification

Contrôle de présence des 164 explications, absence de doublons exacts, conservation des autres champs et validité des références BT utilisées dans les textes. Le panneau « À comprendre » lit directement `notes` dans `dist/catalog.json` : le correctif s’applique donc aux trois points d’entrée (référentiel, démonstration, import). Aucune nouvelle requête réseau n’est ajoutée.
