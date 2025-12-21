'use client';

import { useState, useEffect } from 'react';

interface AutomationRule {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  condition_type: string;
  condition_device_id: string;
  condition_device_name?: string;
  condition_value: string;
  action_type: string;
  action_device_id: string;
  action_device_name?: string;
  action_payload: Record<string, unknown>;
  created_at: string;
}

interface Device {
  device_id: string;
  device_name: string;
  device_type: string;
}

export default function AutomationManager() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
    condition_type: 'temperature_above',
    condition_device_id: 'temp_living_room',
    condition_value: '28',
    action_type: 'set_ac',
    action_device_id: 'ac_living_room',
    action_payload: { power: 'ON', temperature: 22, fan_speed: 'auto' },
  });

  useEffect(() => {
    fetchRules();
    fetchDevices();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/automation/rules');
      const data = await response.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices/status');
      const data = await response.json();
      if (data.success) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const createRule = async () => {
    setLoading(true);
    setMessage('');

    try {
      const url = editingRuleId 
        ? `/api/automation/rules/${editingRuleId}`
        : '/api/automation/rules';
      
      const method = editingRuleId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateForm(false);
        setEditingRuleId(null);
        fetchRules();
        // Reset form
        setFormData({
          name: '',
          description: '',
          enabled: true,
          condition_type: 'temperature_above',
          condition_device_id: 'temp_living_room',
          condition_value: '28',
          action_type: 'set_ac',
          action_device_id: 'ac_living_room',
          action_payload: { power: 'ON', temperature: 22, fan_speed: 'auto' },
        });
      } else {
        setMessage(`✗ ${data.error}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(`✗ Failed to ${editingRuleId ? 'update' : 'create'} rule`);
      console.error(`Failed to ${editingRuleId ? 'update' : 'create'} rule:`, error);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const editRule = (rule: AutomationRule) => {
    const payload = typeof rule.action_payload === 'string'
      ? JSON.parse(rule.action_payload)
      : rule.action_payload;
    
    setFormData({
      name: rule.name,
      description: rule.description || '',
      enabled: rule.enabled,
      condition_type: rule.condition_type,
      condition_device_id: rule.condition_device_id,
      condition_value: rule.condition_value,
      action_type: rule.action_type,
      action_device_id: rule.action_device_id,
      action_payload: payload,
    });
    setEditingRuleId(rule.id);
    setShowCreateForm(true);
  };

  const toggleRule = async (ruleId: number, enabled: boolean) => {
    try {
      const rule = rules.find((r) => r.id === ruleId);
      if (!rule) return;

      const response = await fetch(`/api/automation/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, enabled }),
      });

      const data = await response.json();

      if (data.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const deleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) {
      return;
    }

    try {
      const response = await fetch(`/api/automation/rules/${ruleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchRules();
      } else {
        setMessage(`✗ ${data.error}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('✗ Failed to delete rule');
      console.error('Failed to delete rule:', error);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getConditionDescription = (rule: AutomationRule) => {
    switch (rule.condition_type) {
      case 'temperature_above':
        return `Temperature > ${rule.condition_value}°C`;
      case 'temperature_below':
        return `Temperature < ${rule.condition_value}°C`;
      case 'temperature_equals':
        return `Temperature = ${rule.condition_value}°C`;
      default:
        return `${rule.condition_type}: ${rule.condition_value}`;
    }
  };

  const getActionDescription = (rule: AutomationRule) => {
    const payload = typeof rule.action_payload === 'string' 
      ? JSON.parse(rule.action_payload) 
      : rule.action_payload;

    if (rule.action_device_id === 'ac_living_room') {
      const parts = [];
      if (payload.power) parts.push(`Power: ${payload.power}`);
      if (payload.temperature) parts.push(`${payload.temperature}°C`);
      if (payload.fan_speed) parts.push(`Fan: ${payload.fan_speed}`);
      return parts.join(', ');
    }

    return JSON.stringify(payload);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Automation Rules
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm sm:text-base whitespace-nowrap"
        >
          {showCreateForm ? 'Cancel' : '+ New Rule'}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.startsWith('✓')
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingRuleId ? 'Edit Automation Rule' : 'Create New Automation Rule'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Rule Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Turn on AC when hot"
                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Description (optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this automation does"
                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  When (Condition)
                </label>
                <select
                  value={formData.condition_type}
                  onChange={(e) => setFormData({ ...formData, condition_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="temperature_above">Temperature Above</option>
                  <option value="temperature_below">Temperature Below</option>
                  <option value="temperature_equals">Temperature Equals</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Value (°C)
                </label>
                <input
                  type="number"
                  value={formData.condition_value}
                  onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Then (Action) - AC Settings
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={formData.action_payload.power}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      action_payload: { ...formData.action_payload, power: e.target.value },
                    })
                  }
                  className="px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="ON">Power ON</option>
                  <option value="OFF">Power OFF</option>
                </select>

                <input
                  type="number"
                  min="16"
                  max="30"
                  value={formData.action_payload.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      action_payload: {
                        ...formData.action_payload,
                        temperature: parseInt(e.target.value),
                      },
                    })
                  }
                  placeholder="Temp (16-30)"
                  className="px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />

                <select
                  value={formData.action_payload.fan_speed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      action_payload: { ...formData.action_payload, fan_speed: e.target.value },
                    })
                  }
                  className="px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="auto">Fan Auto</option>
                  <option value="low">Fan Low</option>
                  <option value="medium">Fan Medium</option>
                  <option value="high">Fan High</option>
                </select>
              </div>
            </div>

            <button
              onClick={createRule}
              disabled={loading || !formData.name}
              className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (editingRuleId ? 'Updating...' : 'Creating...') : (editingRuleId ? 'Save Changes' : 'Create Rule')}
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No automation rules yet. Create one to get started!
          </p>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="p-3 sm:p-4 border rounded-lg dark:border-gray-600 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {rule.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        rule.enabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {rule.description}
                    </p>
                  )}
                  <div className="mt-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>When:</strong> {getConditionDescription(rule)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Then:</strong> {getActionDescription(rule)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto sm:ml-4">
                  <button
                    onClick={() => editRule(rule)}
                    className="flex-1 sm:flex-none px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs sm:text-sm whitespace-nowrap"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleRule(rule.id, !rule.enabled)}
                    className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap ${
                      rule.enabled
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="flex-1 sm:flex-none px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs sm:text-sm whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
