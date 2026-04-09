const HOME_ACTIONS = [
  { id: 'rest', label: 'Rest' },
  { id: 'eat', label: 'Eat' },
  { id: 'sleep', label: 'Sleep' },
];

const OFFICE_ACTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'deadline_task', label: 'Deadline Task' },
];

const FARM_ACTIONS = [
  { id: 'harvest', label: 'Harvest' },
  { id: 'plant', label: 'Plant' },
  { id: 'water', label: 'Water' },
  { id: 'farm_rest', label: 'Farm Rest' },
];

const HOSPITAL_ACTIONS = [
  { id: 'treatment', label: 'Treatment' },
  { id: 'consult', label: 'Consult' },
  { id: 'rest_hospital', label: 'Rest Hospital' },
];

const VILLAGE_ACTIONS = [
  { id: 'harvest', label: 'Harvest' },
  { id: 'plant', label: 'Plant' },
  { id: 'water', label: 'Water' },
  { id: 'farm_rest', label: 'Farm Rest' },
];

export default function ActionButtons({
  context,
  onAction,
  disabled = false,
  salary = 0,
  backendActions = null,
}) {
  const fallbackActions = context === 'office'
    ? OFFICE_ACTIONS
    : context === 'farm'
      ? FARM_ACTIONS
      : context === 'hospital'
        ? HOSPITAL_ACTIONS
        : context === 'village'
          ? VILLAGE_ACTIONS
          : HOME_ACTIONS;

  const actions = Array.isArray(backendActions?.actions) && backendActions.actions.length
    ? backendActions.actions
    : fallbackActions;

  const salaryValue = context === 'office'
    ? Number(backendActions?.salary ?? salary)
    : Number(salary);

  return (
    <div className="status-card adaptive-card">
      <h2>Location Actions</h2>
      <p className="panel-note">Context: {String(context).toUpperCase()}</p>
      {context === 'office' ? <p className="panel-note">Salary: {salaryValue.toFixed(2)}</p> : null}

      <div className="button-grid contextual">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={disabled}
            className="action-button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
