const RiskStatus = {
  AtRisk: 1,
  AtRiskMonitor: 2,
  LowRisk: 3,
  VeryLowRisk: 4
}

const RiskLevel = {
  VeryLow: 'Very Low',
  Low: 'Low',
  Medium: 'Medium',
  High: 'High'
}

function RiskViewModel (risk, address) {
  const inTargetArea = risk.inFloodWarningArea || risk.inFloodAlertArea
  const riverAndSeaRisk = risk.riverAndSeaRisk ? risk.riverAndSeaRisk.probabilityForBand : RiskLevel.VeryLow
  const surfaceWaterRisk = risk.surfaceWaterRisk || RiskLevel.VeryLow
  const reservoirRisk = risk.reservoirRisk ? RiskLevel.High : RiskLevel.Low

  if (inTargetArea) {
    this.status = RiskStatus.AtRisk
  } else {
    if ((riverAndSeaRisk === RiskLevel.High || riverAndSeaRisk === RiskLevel.Medium) ||
        (surfaceWaterRisk === RiskLevel.High || surfaceWaterRisk === RiskLevel.Medium) ||
        (reservoirRisk === RiskLevel.High)) {
      this.status = RiskStatus.AtRiskMonitor
    } else {
      if (riverAndSeaRisk === RiskLevel.VeryLow && surfaceWaterRisk === RiskLevel.VeryLow) {
        this.status = RiskStatus.VeryLowRisk
      } else {
        this.status = RiskStatus.LowRisk
      }
    }
  }

  this.isAtRisk = this.status === RiskStatus.AtRisk
  this.isAtRiskMonitor = this.status === RiskStatus.AtRiskMonitor
  this.isLowRisk = this.status === RiskStatus.LowRisk
  this.isVeryLowRisk = this.status === RiskStatus.VeryLowRisk
  this.isRisk = this.isAtRisk || this.isAtRiskMonitor

  if (this.isRisk) {
    this.riverAndSeaRisk = riverAndSeaRisk.toLowerCase()
    this.surfaceWaterRisk = surfaceWaterRisk.toLowerCase()
    this.reservoirRisk = reservoirRisk.toLowerCase()
  }

  if (risk.reservoirRisk) {
    this.reservoirs = [{
      name: risk.reservoirRisk.reservoirName,
      owner: risk.reservoirRisk.leadLocalFloodAuthority,
      authority: risk.reservoirRisk.leadLocalFloodAuthority,
      location: risk.reservoirRisk.location
    }]
  }

  this.easting = address.x
  this.northing = address.y
  this.postcode = address.postcode
  this.lines = address.address.split(', ')
  this.address = address.uprn
  this.surfaceWaterManagement = risk.leadLocalFloodAuthority
  this.leadLocalFloodAuthority = risk.leadLocalFloodAuthority
  this.className = this.isRisk ? 'at-risk' : 'low-risk'
  this.date = Date.now()
}

module.exports = RiskViewModel
