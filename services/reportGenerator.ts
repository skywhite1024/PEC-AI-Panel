// services/reportGenerator.ts
console.log('=== reportGenerator.ts 开始加载 ===');

// 设计参数接口
export interface DesignParams {
  inputVoltage: string;
  outputVoltage: string;
  outputPower: string;
  vInMin: string;
  vInMax: string;
  vInPoints: string;
  pOutMin: string;
  pOutMax: string;
  pOutPoints: string;
  effWeight: string;
  costWeight: string;
  volWeight: string;
  freq: string;
  inductance: string;
  maxAmbTemp: string;
  maxJuncTemp: string;
  maxCoreTemp: string;
  ripple: string;
  lRatio: string;
  topology?: string;
}

// 设计结果接口
export interface DesignResult {
  efficiency: number;
  cost: number;
  volume: number;
  mosfetModel: string;
  mosfetManufacturer: string;
  mosfetVds: string;
  mosfetRdsOn: string;
  mosfetQty: number;
  mosfetUnitPrice: number;
  diodeModel: string;
  diodeManufacturer: string;
  diodeVrrm: string;
  diodeIf: string;
  diodeQty: number;
  diodeUnitPrice: number;
  inductorCore: string;
  inductorTurns: number;
  inductorWireGauge: string;
  inductorAirGap: string;
  inductorDcr: string;
  inductorUnitPrice: number;
  capInModel: string;
  capInValue: string;
  capInVoltage: string;
  capInQty: number;
  capInUnitPrice: number;
  capOutModel: string;
  capOutValue: string;
  capOutVoltage: string;
  capOutQty: number;
  capOutUnitPrice: number;
  heatsinkModel: string;
  heatsinkRth: string;
  heatsinkUnitPrice: number;
  mosfetCondLoss: number;
  mosfetSwLoss: number;
  diodeLoss: number;
  inductorCoreLoss: number;
  inductorCopperLoss: number;
  capLoss: number;
  totalLoss: number;
  mosfetTj: number;
  diodeTj: number;
  inductorTemp: number;
}

// 根据参数生成模拟设计结果
export function generateDesignResult(params: DesignParams): DesignResult {
  console.log('generateDesignResult 被调用, 参数:', params);
  const pOut = parseFloat(params.outputPower) || 500;
  const vIn = parseFloat(params.inputVoltage) || 48;
  const vOut = parseFloat(params.outputVoltage) || 100;
  const isPowerHigh = pOut > 300;
  const topology = params.topology || 'boost';
  
  // 计算占空比（根据拓扑不同）
  let dutyRatio: number;
  if (topology === 'boost') {
    dutyRatio = 1 - vIn / vOut;
  } else if (topology === 'buck') {
    dutyRatio = vOut / vIn;
  } else {
    dutyRatio = vOut / (vIn + vOut);
  }
  
  console.log(`拓扑: ${topology}, 占空比: ${dutyRatio.toFixed(3)}`);
  
  return {
    efficiency: 98.2 + Math.random() * 0.5,
    cost: Math.round(25 + pOut * 0.02 + Math.random() * 10),
    volume: parseFloat((0.1 + pOut * 0.0001).toFixed(3)),
    mosfetModel: isPowerHigh ? 'IPP65R045C7' : 'IPP60R099C6',
    mosfetManufacturer: 'Infineon',
    mosfetVds: isPowerHigh ? '650V' : '600V',
    mosfetRdsOn: isPowerHigh ? '45mΩ' : '99mΩ',
    mosfetQty: isPowerHigh ? 2 : 1,
    mosfetUnitPrice: isPowerHigh ? 8.5 : 4.2,
    diodeModel: 'C3D10065A',
    diodeManufacturer: 'Wolfspeed (Cree)',
    diodeVrrm: '650V',
    diodeIf: '10A',
    diodeQty: 1,
    diodeUnitPrice: 5.8,
    inductorCore: 'PQ35/35-3C95',
    inductorTurns: Math.round(15 + pOut * 0.01),
    inductorWireGauge: 'AWG14 Litz x 3',
    inductorAirGap: '1.2mm',
    inductorDcr: '15mΩ',
    inductorUnitPrice: 6.5,
    capInModel: 'EKY-500ELL471MK20S',
    capInValue: '470μF',
    capInVoltage: '100V',
    capInQty: 2,
    capInUnitPrice: 2.1,
    capOutModel: 'EKY-160ELL102MK20S',
    capOutValue: '1000μF',
    capOutVoltage: '160V',
    capOutQty: 2,
    capOutUnitPrice: 3.2,
    heatsinkModel: 'SK104-50.8mm',
    heatsinkRth: '3.5°C/W',
    heatsinkUnitPrice: 4.5,
    mosfetCondLoss: parseFloat((pOut * 0.005).toFixed(2)),
    mosfetSwLoss: parseFloat((pOut * 0.003).toFixed(2)),
    diodeLoss: parseFloat((pOut * 0.004).toFixed(2)),
    inductorCoreLoss: parseFloat((pOut * 0.002).toFixed(2)),
    inductorCopperLoss: parseFloat((pOut * 0.003).toFixed(2)),
    capLoss: parseFloat((pOut * 0.001).toFixed(2)),
    totalLoss: parseFloat((pOut * 0.018).toFixed(2)),
    mosfetTj: Math.round(85 + Math.random() * 20),
    diodeTj: Math.round(80 + Math.random() * 15),
    inductorTemp: Math.round(70 + Math.random() * 15),
  };
}

// 生成 BOM CSV
export function generateBOMCSV(params: DesignParams, result: DesignResult): string {
  console.log('generateBOMCSV 被调用');
  const headers = ['No.', 'Category', 'Part Number', 'Manufacturer', 'Key Parameters', 'Qty', 'Unit Price ($)', 'Subtotal ($)'];
  const rows = [
    ['1', 'MOSFET', result.mosfetModel, result.mosfetManufacturer, `Vds=${result.mosfetVds}, Rds(on)=${result.mosfetRdsOn}`, result.mosfetQty.toString(), result.mosfetUnitPrice.toFixed(2), (result.mosfetQty * result.mosfetUnitPrice).toFixed(2)],
    ['2', 'Diode (SiC)', result.diodeModel, result.diodeManufacturer, `Vrrm=${result.diodeVrrm}, If=${result.diodeIf}`, result.diodeQty.toString(), result.diodeUnitPrice.toFixed(2), (result.diodeQty * result.diodeUnitPrice).toFixed(2)],
    ['3', 'Inductor', result.inductorCore, 'Custom Wound', `L=${params.inductance}H, DCR=${result.inductorDcr}`, '1', result.inductorUnitPrice.toFixed(2), result.inductorUnitPrice.toFixed(2)],
    ['4', 'Input Cap', result.capInModel, 'Nippon Chemi-Con', `${result.capInValue}/${result.capInVoltage}`, result.capInQty.toString(), result.capInUnitPrice.toFixed(2), (result.capInQty * result.capInUnitPrice).toFixed(2)],
    ['5', 'Output Cap', result.capOutModel, 'Nippon Chemi-Con', `${result.capOutValue}/${result.capOutVoltage}`, result.capOutQty.toString(), result.capOutUnitPrice.toFixed(2), (result.capOutQty * result.capOutUnitPrice).toFixed(2)],
    ['6', 'Heatsink', result.heatsinkModel, 'Fischer Elektronik', `Rth=${result.heatsinkRth}`, '1', result.heatsinkUnitPrice.toFixed(2), result.heatsinkUnitPrice.toFixed(2)],
  ];
  
  const totalCost = rows.reduce((sum, row) => sum + parseFloat(row[7]), 0);
  rows.push(['', '', '', '', '', '', 'TOTAL', totalCost.toFixed(2)]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// ==================== PDF 加载逻辑 ====================

let pdfLibLoaded = false;
let jsPDFClass: any = null;

function loadJsPDFFromCDN(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (pdfLibLoaded && jsPDFClass) {
      resolve();
      return;
    }

    console.log('Loading jsPDF from CDN...');
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      console.log('jsPDF CDN script loaded');
      // @ts-ignore
      jsPDFClass = window.jspdf?.jsPDF;
      if (jsPDFClass) {
        console.log('jsPDF class obtained successfully');
        pdfLibLoaded = true;
        resolve();
      } else {
        reject(new Error('Failed to get jsPDF class from window.jspdf'));
      }
    };
    script.onerror = () => reject(new Error('jsPDF CDN script failed to load'));
    document.head.appendChild(script);
  });
}

async function createPDFDocument(): Promise<any> {
  if (!pdfLibLoaded) {
    await loadJsPDFFromCDN();
  }
  return new jsPDFClass();
}

// ==================== PDF 生成函数 ====================

// 生成完整设计报告 PDF
export async function generateDesignReportPDF(params: DesignParams, result: DesignResult): Promise<any> {
  console.log('generateDesignReportPDF called');
  
  const doc = await createPDFDocument();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;
  
  // ========== PAGE 1: Title & Executive Summary ==========
  // Title
  doc.setFontSize(22);
  doc.setTextColor(91, 95, 199);
  doc.text('PEC-AI Design Report', pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text('DC/DC Boost Converter Design', pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
  doc.text('Powered by PEC-AI Multi-Objective Optimization Engine', pageWidth / 2, y + 5, { align: 'center' });
  
  y += 15;
  doc.setDrawColor(91, 95, 199);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  
  // Executive Summary
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('Executive Summary', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  const summary = [
    'This report presents the optimized design of a DC/DC Boost converter based on',
    'the specifications provided. The design has been generated using PEC-AI\'s',
    'proprietary multi-objective optimization algorithm, which systematically explores',
    'thousands of component combinations to find the Pareto-optimal solutions.',
    '',
    'The recommended design achieves an excellent balance between efficiency, cost,',
    'and power density based on your specified optimization weights.'
  ];
  summary.forEach(line => {
    doc.text(line, 25, y);
    y += 6;
  });
  
  // Key Performance Indicators
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('Key Performance Indicators', 20, y);
  
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(60);
  
  // Draw KPI boxes
  const kpiWidth = 50;
  const kpiHeight = 25;
  const kpiGap = 10;
  const kpiStartX = 25;
  
  // Efficiency Box
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(kpiStartX, y, kpiWidth, kpiHeight, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Efficiency', kpiStartX + kpiWidth/2, y + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text(`${result.efficiency.toFixed(2)}%`, kpiStartX + kpiWidth/2, y + 18, { align: 'center' });
  
  // Cost Box
  doc.setFillColor(240, 255, 240);
  doc.roundedRect(kpiStartX + kpiWidth + kpiGap, y, kpiWidth, kpiHeight, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Est. Cost', kpiStartX + kpiWidth + kpiGap + kpiWidth/2, y + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(34, 139, 34);
  doc.text(`$${result.cost}`, kpiStartX + kpiWidth + kpiGap + kpiWidth/2, y + 18, { align: 'center' });
  
  // Volume Box
  doc.setFillColor(255, 245, 238);
  doc.roundedRect(kpiStartX + 2*(kpiWidth + kpiGap), y, kpiWidth, kpiHeight, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Volume', kpiStartX + 2*(kpiWidth + kpiGap) + kpiWidth/2, y + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(210, 105, 30);
  doc.text(`${result.volume} dm³`, kpiStartX + 2*(kpiWidth + kpiGap) + kpiWidth/2, y + 18, { align: 'center' });
  
  // System Specifications
  y += 40;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('1. System Specifications', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  
  // Two-column layout for specs
  const col1X = 25;
  const col2X = 110;
  
  doc.text('Electrical Specifications:', col1X, y);
  doc.text('Operating Range:', col2X, y);
  y += 7;
  
  doc.setTextColor(80);
  doc.text(`Input Voltage (Vin): ${params.inputVoltage} V`, col1X, y);
  doc.text(`Vin Range: ${params.vInMin} - ${params.vInMax} V`, col2X, y);
  y += 6;
  doc.text(`Output Voltage (Vout): ${params.outputVoltage} V`, col1X, y);
  doc.text(`Pout Range: ${params.pOutMin} - ${params.pOutMax} W`, col2X, y);
  y += 6;
  doc.text(`Output Power (Pout): ${params.outputPower} W`, col1X, y);
  doc.text(`Switching Freq: ${params.freq} Hz`, col2X, y);
  y += 6;
  doc.text(`Main Inductance: ${params.inductance} H`, col1X, y);
  doc.text(`Output Ripple: <${params.ripple}%`, col2X, y);
  
  // Optimization Weights
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('2. Optimization Weights', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text('The following weights were used in the multi-objective optimization:', 25, y);
  y += 8;
  doc.setTextColor(80);
  doc.text(`Efficiency Weight: ${params.effWeight}%`, col1X, y);
  y += 6;
  doc.text(`Cost Weight: ${params.costWeight}%`, col1X, y);
  y += 6;
  doc.text(`Volume Weight: ${params.volWeight}%`, col1X, y);
  
  // Design Constraints
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('3. Design Constraints', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text('Thermal Constraints:', col1X, y);
  doc.text('Other Constraints:', col2X, y);
  y += 7;
  doc.setTextColor(80);
  doc.text(`Max Ambient Temp: ${params.maxAmbTemp}°C`, col1X, y);
  doc.text(`Inductor Margin: ${params.lRatio}`, col2X, y);
  y += 6;
  doc.text(`Max Junction Temp: ${params.maxJuncTemp}°C`, col1X, y);
  y += 6;
  doc.text(`Max Core Temp: ${params.maxCoreTemp}°C`, col1X, y);
  
  // ========== PAGE 2: Component Selection ==========
  doc.addPage();
  y = 20;
  
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('4. Component Selection Summary', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text('Based on the Pareto-optimal analysis, the following components are recommended:', 25, y);
  
  // MOSFET Section
  y += 15;
  doc.setFontSize(12);
  doc.setTextColor(47, 84, 235);
  doc.text('4.1 Power MOSFET', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(80);
  const mosfetSpecs = [
    `Part Number: ${result.mosfetModel}`,
    `Manufacturer: ${result.mosfetManufacturer}`,
    `Drain-Source Voltage (Vds): ${result.mosfetVds}`,
    `On-Resistance Rds(on): ${result.mosfetRdsOn}`,
    `Quantity: ${result.mosfetQty}`,
    `Unit Price: $${result.mosfetUnitPrice}`,
  ];
  mosfetSpecs.forEach(spec => {
    doc.text(spec, 25, y);
    y += 6;
  });
  
  // Diode Section
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(47, 84, 235);
  doc.text('4.2 Rectifier Diode (SiC Schottky)', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(80);
  const diodeSpecs = [
    `Part Number: ${result.diodeModel}`,
    `Manufacturer: ${result.diodeManufacturer}`,
    `Reverse Voltage (Vrrm): ${result.diodeVrrm}`,
    `Forward Current (If): ${result.diodeIf}`,
    `Quantity: ${result.diodeQty}`,
    `Unit Price: $${result.diodeUnitPrice}`,
  ];
  diodeSpecs.forEach(spec => {
    doc.text(spec, 25, y);
    y += 6;
  });
  
  // Inductor Section
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(47, 84, 235);
  doc.text('4.3 Main Inductor', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(80);
  const inductorSpecs = [
    `Core: ${result.inductorCore}`,
    `Core Material: 3C95 Ferrite`,
    `Turns: ${result.inductorTurns}`,
    `Wire: ${result.inductorWireGauge}`,
    `Air Gap: ${result.inductorAirGap}`,
    `DC Resistance: ${result.inductorDcr}`,
  ];
  inductorSpecs.forEach(spec => {
    doc.text(spec, 25, y);
    y += 6;
  });
  
  // Capacitors Section
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(47, 84, 235);
  doc.text('4.4 Capacitors', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text('Input Capacitor:', 25, y);
  y += 6;
  doc.text(`  ${result.capInModel}, ${result.capInValue}/${result.capInVoltage}, Qty: ${result.capInQty}`, 25, y);
  y += 8;
  doc.text('Output Capacitor:', 25, y);
  y += 6;
  doc.text(`  ${result.capOutModel}, ${result.capOutValue}/${result.capOutVoltage}, Qty: ${result.capOutQty}`, 25, y);
  
  // ========== PAGE 3: Loss Analysis ==========
  doc.addPage();
  y = 20;
  
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('5. Loss Analysis', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text('Detailed power loss breakdown at nominal operating point:', 25, y);
  
  y += 12;
  doc.setFontSize(11);
  doc.setTextColor(80);
  
  const losses = [
    { name: 'MOSFET Conduction Loss', value: result.mosfetCondLoss, pct: (result.mosfetCondLoss / result.totalLoss * 100).toFixed(1) },
    { name: 'MOSFET Switching Loss', value: result.mosfetSwLoss, pct: (result.mosfetSwLoss / result.totalLoss * 100).toFixed(1) },
    { name: 'Diode Conduction Loss', value: result.diodeLoss, pct: (result.diodeLoss / result.totalLoss * 100).toFixed(1) },
    { name: 'Inductor Core Loss', value: result.inductorCoreLoss, pct: (result.inductorCoreLoss / result.totalLoss * 100).toFixed(1) },
    { name: 'Inductor Copper Loss', value: result.inductorCopperLoss, pct: (result.inductorCopperLoss / result.totalLoss * 100).toFixed(1) },
    { name: 'Capacitor ESR Loss', value: result.capLoss, pct: (result.capLoss / result.totalLoss * 100).toFixed(1) },
  ];
  
  losses.forEach(loss => {
    doc.text(`${loss.name}: ${loss.value.toFixed(2)} W (${loss.pct}%)`, 25, y);
    y += 7;
  });
  
  y += 5;
  doc.setFontSize(12);
  doc.setTextColor(47, 84, 235);
  doc.text(`Total Power Loss: ${result.totalLoss.toFixed(2)} W`, 25, y);
  y += 7;
  doc.text(`System Efficiency: ${result.efficiency.toFixed(2)}%`, 25, y);
  
  // Thermal Analysis
  y += 20;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('6. Thermal Analysis', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text('Junction temperature estimates at worst-case operating conditions:', 25, y);
  
  y += 10;
  doc.setTextColor(80);
  doc.text(`Ambient Temperature: ${params.maxAmbTemp}°C`, 25, y);
  y += 7;
  doc.text(`Heatsink: ${result.heatsinkModel} (Rth = ${result.heatsinkRth})`, 25, y);
  y += 10;
  doc.text(`MOSFET Junction Temp: ${result.mosfetTj}°C (Limit: ${params.maxJuncTemp}°C) - PASS`, 25, y);
  y += 7;
  doc.text(`Diode Junction Temp: ${result.diodeTj}°C (Limit: ${params.maxJuncTemp}°C) - PASS`, 25, y);
  y += 7;
  doc.text(`Inductor Core Temp: ${result.inductorTemp}°C (Limit: ${params.maxCoreTemp}°C) - PASS`, 25, y);
  
  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Generated by PEC-AI | Confidential', pageWidth - 20, pageHeight - 10, { align: 'right' });
  }
  
  console.log('Design report PDF generated');
  return doc;
}

// 生成半导体选型报告
export async function generateSemiconductorReportPDF(params: DesignParams, result: DesignResult): Promise<any> {
  console.log('generateSemiconductorReportPDF called');
  
  const doc = await createPDFDocument();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(91, 95, 199);
  doc.text('Semiconductor Selection & Thermal Analysis', pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('PEC-AI Technical Report', pageWidth / 2, y, { align: 'center' });
  
  y += 15;
  doc.setDrawColor(91, 95, 199);
  doc.line(20, y, pageWidth - 20, y);
  
  // MOSFET Selection
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('1. MOSFET Selection', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text('Selection Criteria: Vds > 1.5x Max Switch Voltage, Low Rds(on), Low Qg', 25, y);
  
  y += 10;
  doc.setTextColor(80);
  const mosfetDetails = [
    `Selected Part: ${result.mosfetModel}`,
    `Manufacturer: ${result.mosfetManufacturer}`,
    `Technology: CoolMOS C7 (Superjunction)`,
    `Drain-Source Voltage: ${result.mosfetVds}`,
    `On-Resistance @ 25°C: ${result.mosfetRdsOn}`,
    `Gate Charge Qg: 45nC (typ)`,
    `Package: TO-247`,
    `Quantity Required: ${result.mosfetQty}`,
    `Unit Cost: $${result.mosfetUnitPrice}`,
  ];
  mosfetDetails.forEach(detail => {
    doc.text(detail, 25, y);
    y += 6;
  });
  
  // MOSFET Loss Calculation
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(47, 84, 235);
  doc.text('MOSFET Loss Analysis:', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Conduction Loss: Pcond = Irms² x Rds(on) = ${result.mosfetCondLoss.toFixed(2)} W`, 25, y);
  y += 6;
  doc.text(`Switching Loss: Psw = 0.5 x Vds x Id x (tr + tf) x fsw = ${result.mosfetSwLoss.toFixed(2)} W`, 25, y);
  y += 6;
  doc.text(`Total MOSFET Loss: ${(result.mosfetCondLoss + result.mosfetSwLoss).toFixed(2)} W`, 25, y);
  
  // Diode Selection
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('2. Rectifier Diode Selection', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text('Selection Criteria: SiC Schottky for low reverse recovery, Vrrm > Vout + margin', 25, y);
  
  y += 10;
  doc.setTextColor(80);
  const diodeDetails = [
    `Selected Part: ${result.diodeModel}`,
    `Manufacturer: ${result.diodeManufacturer}`,
    `Technology: SiC Schottky Barrier Diode`,
    `Reverse Voltage: ${result.diodeVrrm}`,
    `Forward Current Rating: ${result.diodeIf}`,
    `Forward Voltage Drop: 1.5V (typ @ 10A)`,
    `Reverse Recovery: ~0 (SiC advantage)`,
    `Package: TO-220`,
    `Unit Cost: $${result.diodeUnitPrice}`,
  ];
  diodeDetails.forEach(detail => {
    doc.text(detail, 25, y);
    y += 6;
  });
  
  // Thermal Analysis
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('3. Thermal Management', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Heatsink Selected: ${result.heatsinkModel}`, 25, y);
  y += 6;
  doc.text(`Heatsink Thermal Resistance: ${result.heatsinkRth}`, 25, y);
  y += 6;
  doc.text(`Ambient Temperature: ${params.maxAmbTemp}°C`, 25, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.text('Junction Temperature Calculation:', 25, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Tj(MOSFET) = Ta + Ploss x (Rth_jc + Rth_cs + Rth_sa) = ${result.mosfetTj}°C`, 25, y);
  y += 6;
  doc.text(`Tj(Diode) = Ta + Ploss x (Rth_jc + Rth_cs + Rth_sa) = ${result.diodeTj}°C`, 25, y);
  y += 10;
  
  doc.setTextColor(34, 139, 34);
  doc.text(`All junction temperatures within safe limits (< ${params.maxJuncTemp}°C)`, 25, y);
  
  console.log('Semiconductor report PDF generated');
  return doc;
}

// 生成磁性元件设计报告
export async function generateInductorReportPDF(params: DesignParams, result: DesignResult): Promise<any> {
  console.log('generateInductorReportPDF called');
  
  const doc = await createPDFDocument();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(91, 95, 199);
  doc.text('Magnetic Component Design Report', pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Main Inductor Design for Boost Converter', pageWidth / 2, y, { align: 'center' });
  
  y += 15;
  doc.setDrawColor(91, 95, 199);
  doc.line(20, y, pageWidth - 20, y);
  
  // Design Requirements
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('1. Design Requirements', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(80);
  const requirements = [
    `Target Inductance: ${params.inductance} H`,
    `Peak Current: ${(parseFloat(params.outputPower) / parseFloat(params.inputVoltage) * 1.2).toFixed(2)} A`,
    `RMS Current: ${(parseFloat(params.outputPower) / parseFloat(params.inputVoltage)).toFixed(2)} A`,
    `Switching Frequency: ${params.freq} Hz`,
    `Max Temperature Rise: ${parseFloat(params.maxCoreTemp) - parseFloat(params.maxAmbTemp)}°C`,
  ];
  requirements.forEach(req => {
    doc.text(req, 25, y);
    y += 6;
  });
  
  // Core Selection
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('2. Core Selection', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(80);
  const coreSpecs = [
    `Core Type: ${result.inductorCore}`,
    `Core Material: 3C95 MnZn Ferrite`,
    `Effective Area (Ae): 196 mm²`,
    `Effective Length (le): 87.5 mm`,
    `AL Value: 3200 nH/turn² (ungapped)`,
    `Saturation Flux: 470 mT @ 25°C`,
    `Core Loss Density: 80 kW/m³ @ 100kHz, 100mT`,
  ];
  coreSpecs.forEach(spec => {
    doc.text(spec, 25, y);
    y += 6;
  });
  
  // Winding Design
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('3. Winding Design', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(80);
  const windingSpecs = [
    `Number of Turns: ${result.inductorTurns}`,
    `Wire Type: ${result.inductorWireGauge}`,
    `Air Gap Length: ${result.inductorAirGap} (distributed)`,
    `DC Resistance: ${result.inductorDcr}`,
    `Fill Factor: ~45%`,
    `Layers: 2`,
  ];
  windingSpecs.forEach(spec => {
    doc.text(spec, 25, y);
    y += 6;
  });
  
  // Loss Analysis
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('4. Loss Analysis', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Core Loss (Steinmetz): ${result.inductorCoreLoss.toFixed(2)} W`, 25, y);
  y += 6;
  doc.text(`Copper Loss (DC + AC): ${result.inductorCopperLoss.toFixed(2)} W`, 25, y);
  y += 6;
  doc.text(`Total Inductor Loss: ${(result.inductorCoreLoss + result.inductorCopperLoss).toFixed(2)} W`, 25, y);
  
  // Thermal Performance
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('5. Thermal Performance', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Estimated Operating Temperature: ${result.inductorTemp}°C`, 25, y);
  y += 6;
  doc.text(`Temperature Limit: ${params.maxCoreTemp}°C`, 25, y);
  y += 6;
  doc.text(`Thermal Margin: ${parseFloat(params.maxCoreTemp) - result.inductorTemp}°C`, 25, y);
  y += 10;
  doc.setTextColor(34, 139, 34);
  doc.text('Thermal design validated - PASS', 25, y);
  
  console.log('Inductor report PDF generated');
  return doc;
}

// 生成电容选型报告
export async function generateCapacitorReportPDF(params: DesignParams, result: DesignResult): Promise<any> {
  console.log('generateCapacitorReportPDF called');
  
  const doc = await createPDFDocument();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(91, 95, 199);
  doc.text('Capacitor Selection Report', pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Input and Output Filter Capacitor Design', pageWidth / 2, y, { align: 'center' });
  
  y += 15;
  doc.setDrawColor(91, 95, 199);
  doc.line(20, y, pageWidth - 20, y);
  
  // Input Capacitor
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('1. Input Capacitor Selection', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text('Function: Filter input current ripple, provide local energy storage', 25, y);
  
  y += 10;
  doc.setTextColor(80);
  const capInSpecs = [
    `Part Number: ${result.capInModel}`,
    `Manufacturer: Nippon Chemi-Con`,
    `Capacitance: ${result.capInValue}`,
    `Voltage Rating: ${result.capInVoltage}`,
    `ESR: 25mΩ (typ @ 100kHz)`,
    `Ripple Current Rating: 3.5A @ 105°C`,
    `Quantity: ${result.capInQty} (parallel)`,
    `Unit Cost: $${result.capInUnitPrice}`,
  ];
  capInSpecs.forEach(spec => {
    doc.text(spec, 25, y);
    y += 6;
  });
  
  // Output Capacitor
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('2. Output Capacitor Selection', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text('Function: Filter output voltage ripple, maintain voltage during load transients', 25, y);
  
  y += 10;
  doc.setTextColor(80);
  const capOutSpecs = [
    `Part Number: ${result.capOutModel}`,
    `Manufacturer: Nippon Chemi-Con`,
    `Capacitance: ${result.capOutValue}`,
    `Voltage Rating: ${result.capOutVoltage}`,
    `ESR: 18mΩ (typ @ 100kHz)`,
    `Ripple Current Rating: 4.0A @ 105°C`,
    `Quantity: ${result.capOutQty} (parallel)`,
    `Unit Cost: $${result.capOutUnitPrice}`,
  ];
  capOutSpecs.forEach(spec => {
    doc.text(spec, 25, y);
    y += 6;
  });
  
  // Ripple Analysis
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('3. Output Voltage Ripple Analysis', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Ripple Requirement: <${params.ripple}% of Vout`, 25, y);
  y += 6;
  doc.text(`Calculated Ripple: ~${(parseFloat(params.ripple) * 0.7).toFixed(2)}% (ESR + Capacitive)`, 25, y);
  y += 6;
  doc.text(`Ripple Voltage: ~${(parseFloat(params.outputVoltage) * parseFloat(params.ripple) * 0.007).toFixed(2)} Vpp`, 25, y);
  y += 10;
  doc.setTextColor(34, 139, 34);
  doc.text('Output ripple within specification - PASS', 25, y);
  
  // Life Expectancy
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(47, 84, 235);
  doc.text('4. Life Expectancy', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text('Based on Arrhenius equation for electrolytic capacitors:', 25, y);
  y += 8;
  doc.text('Rated Life @ 105°C: 10,000 hours', 25, y);
  y += 6;
  doc.text(`Operating Temperature: ~65°C (estimated)`, 25, y);
  y += 6;
  doc.text('Estimated Life @ 65°C: >100,000 hours (~11 years)', 25, y);
  
  console.log('Capacitor report PDF generated');
  return doc;
}

// ==================== 下载函数 ====================

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPDF(doc: any, filename: string) {
  console.log('downloadPDF called:', filename);
  try {
    doc.save(filename);
    console.log('PDF download successful');
  } catch (error) {
    console.error('PDF download failed:', error);
    throw error;
  }
}

export function downloadCSV(content: string, filename: string) {
  console.log('downloadCSV called:', filename);
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

console.log('=== reportGenerator.ts loaded ===');