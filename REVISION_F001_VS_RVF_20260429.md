# Revision F-001 vs RVF - Composicion Garantizada

**Fecha:** 2026-04-29  
**Archivo revisado:** `F-001-FERTILIZANTES_DILIGENCIADO.xlsx`  
**Fuente de contraste:** PDFs en `RVF/` extraidos con `pdftotext`

## Resumen ejecutivo

El F-001 no debe enviarse aun. Hay coincidencias exactas en varios productos, pero tambien hay errores regulatorios materiales: valores garantizados distintos al RVF, nutrientes omitidos, y nombres de ingrediente activo con forma quimica incorrecta (`total` vs `asimilable`, `soluble en agua` o `soluble en HCl`).

## Hallazgos criticos

| Registro | Producto | Estado | Correccion requerida |
|---:|---|---|---|
| 14125 | CALFERCORRECTIVO | **No coincide** | RVF: CaO 16.00%, MgO 14.00%, S 2.5%, SiO2 14.0%. F-001 tiene CaO 34.00%, S 13.00%, SiO2 40.00%. |
| 2949 | CALFERZINC-P | **No coincide** | RVF: Fosforo asimilable (P2O5) 3%, Azufre total (S) 7%, Zinc (Zn) 21%. F-001 omite Azufre y tiene Zinc 22%. |
| 13702 | ZUELO-CA | **Incompleto/no coincide** | RVF incluye K2O 3%, CaO total 27.22%, CaO soluble agua 4.59%, MgO total 11.54%, MgO soluble agua 1.61%, S total 3.61%, S soluble agua 3.06%, B 0.19%, SiO2 total 3.47%, SiO2 soluble agua 0.36%. F-001 solo trae 5 componentes redondeados y omite los solubles y B. |
| 3537 | CALFERQUIM 15-15-15 | **Incompleto** | RVF incluye N total 15.0%, N amoniacal 5.8%, N ureico 9.2%, P2O5 asimilable 15.0%, K2O soluble agua 15.0%, CaO soluble HCl 7.0%, MgO soluble HCl 3.0%, SiO2 total 5.6%. F-001 solo trae N/P/K. |
| 13872 | 1-CRECIMIENTO | **Incompleto/valor errado** | RVF incluye Cobalto soluble 0.003% y Molibdeno soluble 0.005%. F-001 omite Cobalto y registra Molibdeno 0.01%. |
| 13859 | 2-AVANCE | **Incompleto/valor errado** | RVF incluye Cobalto soluble 0.002%, Silicio soluble 0.30%, Molibdeno soluble 0.005%. F-001 omite Cobalto y Silicio, y registra Molibdeno 0.01%. |
| 13824 | CALFER LLENADO | **No coincide** | RVF: ingredientes solubles/asimilables, B 0.020%, Co 0.002%, Cu 0.020%, Fe 0.055%, Mn 0.056%, Mo 0.005%, Zn 0.020%. F-001 usa varias etiquetas `total`, omite Co y tiene B 2.00% en vez de 0.020%. |

## Diferencias de denominacion que deben ajustarse

| Registro | Producto | Ajuste de denominacion |
|---:|---|---|
| 4415 | AFOS-K 0-40-50 | RVF dice Fosforo soluble en agua y Potasio soluble en agua; F-001 dice Fosforo total y Potasio total. |
| 13751 | SOLURAIFOS | F-001 coincide numericamente, pero debe conservar `Fosforo asimilable` y `Potasio soluble en agua` como el RVF. |
| 13749 | SULFA K 50 | F-001 coincide numericamente, mantener `Fosforo asimilable`, `Potasio soluble en agua`, `Azufre total`. |
| 13883 | MAGNE 3 | Valor coincide, pero RVF dice K2O soluble en agua; CaO, MgO, S y SiO2 total. |
| 13801 | K2K | Carbono organico oxidable debe ser 5.07%, no 5.00%. Silicio figura como `SILICIO` 1% en RVF; revisar si debe reportarse como SiO2 antes de radicar. |
| 13918 | ORGANIC-M | Composicion coincide bien; conservar nombres `soluble en agua`, `total` y `oxidable` como en RVF. |
| 13866 | 3-PRODUCTOR | Coincide con el RVF extraido; el PDF dice Registro de Venta No. 13866 aunque el nombre de archivo trae 13867. |

## Productos sin contraste completo por PDF escaneado o RVF faltante

No pude confirmar la composicion desde texto extraible de RVF para estos registros. Requieren OCR o revision visual/manual del PDF:

- 2812 - FOSFORITA NEIVA
- 4179 - CALFERBORO
- 3601 - CALFERQUIM SILIMAGRAN 30
- 3536 - FERTIMENORES NP 4-10-0
- 5060 - CALFERQUIM 17-6-18-2
- 4533 - CALFERQUIM 18-18-18
- 9386 - FERTILIZANTE 25-4-24
- 5884 - BIOPLANTAS
- 13446 - RAIFOS 20
- 13879 - CALFER DESARROLLO

## Recomendacion

Antes de diligenciar o radicar en SimplifICA, corregir el F-001 usando literalmente la composicion garantizada de cada RVF vigente: mismo nutriente, misma forma quimica/solubilidad, mismo orden y mismo porcentaje.
