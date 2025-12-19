SENTECIAS SQL PARA AGREGAR COLUMNA "sale", "discount" y "priceWithDiscount" en tabla "producto" (COLOCAR DE A PARES 3 VECES en PHP My Admin)

ALTER TABLE producto
ADD COLUMN sale ENUM('0', '1') DEFAULT '0'

ALTER TABLE producto
ADD COLUMN discount INT DEFAULT 0

ALTER TABLE producto
ADD COLUMN priceWithDiscount DECIMAL(12,2) DEFAULT 0