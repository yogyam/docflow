import React, { useState } from 'react';
import { Check, FileText, Users, Code, ArrowRight } from 'lucide-react';

const RoleBasedGuides = ({ repository, documentationData, onRoleSelected, selectedRole: propSelectedRole }) => {
  const [selectedRole, setSelectedRole] = useState(propSelectedRole || null);

  const roles = [
    {
      id: 'backend',
      name: 'Backend Developer',
      icon: Code,
      color: 'blue',
      description: 'API endpoints, database setup, and server-side development',
      focus: ['API Reference', 'Database Schema', 'Environment Setup', 'Deployment']
    },
    {
      id: 'frontend',
      name: 'Frontend Developer',
      icon: FileText,
      color: 'green',
      description: 'API integration, UI components, and client-side development',
      focus: ['API Integration', 'Component Structure', 'State Management', 'UI Guidelines']
    },
    {
      id: 'product-manager',
      name: 'Product Manager',
      icon: Users,
      color: 'purple',
      description: 'Feature overview, capabilities, and high-level architecture',
      focus: ['Feature Overview', 'User Flows', 'Technical Architecture', 'Roadmap']
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole && onRoleSelected) {
      onRoleSelected(selectedRole);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Choose Your Role</h2>
            <p className="text-sm text-gray-600">Select your role to get personalized documentation for {repository.name}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!selectedRole ? (
          <div className="space-y-6">
            <p className="text-gray-600 text-center">Choose your role to receive customized documentation and guidance:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="p-6 rounded-lg border-2 transition-all hover:border-indigo-300 border-gray-200 bg-white hover:bg-gray-50 text-left"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-indigo-100">
                          <Icon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{role.name}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">You'll get:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {role.focus.map((item, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <Check className="w-3 h-3 text-green-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {selectedRole && roles.find(r => r.id === selectedRole) && (
                  <>
                    {React.createElement(roles.find(r => r.id === selectedRole).icon, { className: "w-5 h-5 text-indigo-600" })}
                    <div>
                      <h3 className="font-medium text-indigo-900">{roles.find(r => r.id === selectedRole)?.name}</h3>
                      <p className="text-sm text-indigo-700">Documentation will be customized for your role</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Change Role
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">What you'll get as a {roles.find(r => r.id === selectedRole)?.name}:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.find(r => r.id === selectedRole)?.focus.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleContinue}
                className="inline-flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                <span>Continue to Documentation Generation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedGuides;
