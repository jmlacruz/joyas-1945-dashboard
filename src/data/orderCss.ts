export const orderCSS = 
`
.orderForMailCont {
    margin-top: var(--navbar-height);
    width: 100%;
}

.order-details {
    font-family: Arial, sans-serif;
    margin: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 1000px;
    max-width: 100%;
    --bg-color: #f5f5f5;
}

.order-details * {
    text-align: left;
}

.product-details {
    overflow-x: auto;
}

.order-details th {
    font-weight: bold;
}

.order-details td, .order-details th {
    text-align: center;
}

.order-details table th {
    background-color: var(--bg-color);
}

.order-details h1 {
    align-self: center;
    font-size: 30px;
    font-weight: bold;
    color: #3DB0F5;
    margin-bottom: 40px;
}

.orderForMail-headCell {
    height: 100%;
    width: 100%;
    align-items: flex-start;
    padding-top: 20px;
}

.order-details strong {
    font-weight: bold;
}

.bank-details,
.total-details {
    margin-bottom: 20px;
}

.order-info {
    align-items: flex-start;
    margin: 25px 0;
}

.order-info p {
    margin-top: 5px;
    margin-bottom: 5px;
}

.bank-details {
    align-items: flex-start;
    padding: 25px 0;
    margin-bottom: 0;
}

.bank-details p {
    margin-top: 10px;
}

.product-details {
    align-items: flex-start;
}

.product-details table,
.total-details table {
    width: 100%;
    border-collapse: collapse;
}

.product-details table th,
.product-details table td,
.total-details table td,
.total-details table th {
    border: 1px solid #ddd;
    padding: 8px;
}

.product-details h2 {
    align-self: flex-start;
    margin-bottom: 10px;
}

.total-details-productNameHead, .product-details-productNameHead {
    min-width: 200px;
    text-align: left !important;
}

.total-details-headCont {
    width: 100%;
    overflow-x: auto;
}

.product-details td.orderForMail_productRow_desc, .total-details td.orderForMail_productRow_desc {
    padding-left: 0.5rem;
    text-align: left;
}

.orderForMail_productRow_image {
    max-width: 100px;
    aspect-ratio: 1/1;
}

.total-details-resume {
    margin-top: 25px;
}

.total-details-resume td {
    background-color: var(--bg-color);
}

.total-details-resume tr td:first-child{
    text-align: right;
}

.total-details-productRow, .orderForMail_productRow {
    background-color: white;
}

`;