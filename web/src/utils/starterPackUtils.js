export function exportStarterPack(projects, tasks) {
  const packId = `starter_pack_${Date.now()}`;
  
  // Create life zones (projects / sections mapping)
  const lifeZones = projects.map(proj => ({
    id: proj.id,
    name: proj.name,
    colorTheme: proj.color,
    icon: proj.icon,
    sections: proj.sections || []
  }));

  // Clean task data for export (remove local execution state)
  const templateTasks = tasks.map(t => {
    const { 
      id, completed, lastCompletedAt, lastDegradedAt, healthPercentage, 
      isNew, type, ...cleanTask 
    } = t;
    
    // Default to quick chore for export, or preserve if strictly set
    return {
      ...cleanTask,
      id: `template_${id}`, // Ensure unique templated IDs
      type: type || 'quick_chore',
      healthPercentage: 100 // Reset health for templates
    };
  });

  const payload = {
    $schema: "http://json-schema.org/draft-07/schema#",
    packId,
    packName: "My ADHD Task Engine Backup",
    description: "Exported starter pack from the FocusFlow app.",
    lifeZones,
    tasks: templateTasks
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `focusflow_${packId}.json`);
  dlAnchorElem.click();
}
