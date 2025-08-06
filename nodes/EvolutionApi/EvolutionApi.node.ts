import { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class EvolutionApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Evolution API Lite',
		name: 'evolutionApi',
		icon: 'file:evolutionapi.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Evolution API - Lite Version',
		defaults: {
			name: 'Evolution API Lite',
		},
		inputs: ['main'] as any,
		outputs: ['main'] as any,
		credentials: [
			{
				name: 'evolutionApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Chat',
						value: 'chat',
					},
				],
				default: 'message',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: 'Send Text',
						value: 'sendText',
						description: 'Send a text message',
						action: 'Send a text message',
					},
					{
						name: 'Send Image',
						value: 'sendImage',
						description: 'Send an image message',
						action: 'Send an image message',
					},
					{
						name: 'Send Video',
						value: 'sendVideo',
						description: 'Send a video message',
						action: 'Send a video message',
					},
					{
						name: 'Send Audio',
						value: 'sendAudio',
						description: 'Send an audio message',
						action: 'Send an audio message',
					},
					{
						name: 'Send Document',
						value: 'sendDocument',
						description: 'Send a document message',
						action: 'Send a document message',
					},
					{
						name: 'Send Contact',
						value: 'sendContact',
						description: 'Send a contact message',
						action: 'Send a contact message',
					},
					{
						name: 'Send List',
						value: 'sendList',
						description: 'Send a list message',
						action: 'Send a list message',
					},
					{
						name: 'Send Button',
						value: 'sendButton',
						description: 'Send a button message',
						action: 'Send a button message',
					},
				],
				default: 'sendText',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['chat'],
					},
				},
				options: [
					{
						name: 'Verify Number',
						value: 'verifyNumber',
						description: 'Verify if a number exists on WhatsApp',
						action: 'Verify if a number exists on whats app',
					},
				],
				default: 'verifyNumber',
			},
			// Instance field
			{
				displayName: 'Instance Name',
				name: 'instanceName',
				type: 'string',
				default: '',
				description: 'Name of the instance that will send the message',
				required: true,
				displayOptions: {
					show: {
						resource: ['message', 'chat'],
					},
				},
			},
			// Common fields
			{
				displayName: 'Number',
				name: 'number',
				type: 'string',
				default: '',
				placeholder: '5511999999999',
				description: 'Phone number with country code (without +)',
				required: true,
				displayOptions: {
					show: {
						resource: ['message', 'chat'],
					},
				},
			},
			// Text message fields
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '',
				description: 'Text message to send',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendText'],
					},
				},
			},
			// Media message fields
			{
				displayName: 'Media URL',
				name: 'mediaUrl',
				type: 'string',
				default: '',
				description: 'URL of the media file',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendImage', 'sendVideo', 'sendAudio', 'sendDocument'],
					},
				},
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
				description: 'Caption for the media message',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendImage', 'sendVideo', 'sendDocument'],
					},
				},
			},
			// Contact fields
			{
				displayName: 'Contact Name',
				name: 'contactName',
				type: 'string',
				default: '',
				description: 'Name of the contact',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendContact'],
					},
				},
			},
			{
				displayName: 'Contact Number',
				name: 'contactNumber',
				type: 'string',
				default: '',
				placeholder: '5511999999999',
				description: 'Phone number of the contact',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendContact'],
					},
				},
			},
			// List fields
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title of the list',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendList'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the list',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendList'],
					},
				},
			},
			{
				displayName: 'Button Text',
				name: 'buttonText',
				type: 'string',
				default: 'Ver Opções',
				description: 'Text that will appear on the list button',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendList'],
					},
				},
			},
			{
				displayName: 'Footer Text',
				name: 'footerText',
				type: 'string',
				default: '',
				description: 'Text that will appear in the footer of the list',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendList'],
					},
				},
			},
			{
				displayName: 'Sections',
				name: 'sections',
				placeholder: 'Add Section',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'sectionValues',
						displayName: 'Section',
						values: [
							{
								displayName: 'Section Title',
								name: 'title',
								type: 'string',
								default: '',
								description: 'Title of the section',
							},
							{
								displayName: 'Rows',
								name: 'rows',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true,
								},
								default: {},
								options: [
									{
										name: 'rowValues',
										displayName: 'Row',
										values: [
											{
												displayName: 'Title',
												name: 'title',
												type: 'string',
												default: '',
												description: 'Row title',
											},
											{
												displayName: 'Description',
												name: 'description',
												type: 'string',
												default: '',
												description: 'Row description',
											},
											{
												displayName: 'Row ID',
												name: 'rowId',
												type: 'string',
												default: '',
												description: 'Unique identifier for the row',
											},
										],
									},
								],
							},
						],
					},
				],
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendList'],
					},
				},
			},
			// Button fields
			{
				displayName: 'Button Title',
				name: 'buttonTitle',
				type: 'string',
				default: '',
				description: 'Title of the button message',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendButton'],
					},
				},
			},
			{
				displayName: 'Button Text',
				name: 'buttonText',
				type: 'string',
				default: '',
				description: 'Text of the button message',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendButton'],
					},
				},
			},
			{
				displayName: 'Buttons',
				name: 'buttons',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				description: 'Buttons to display',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendButton'],
					},
				},
				default: {},
				options: [
					{
						name: 'buttonItems',
						displayName: 'Button Items',
						values: [
							{
								displayName: 'Button ID',
								name: 'buttonId',
								type: 'string',
								default: '',
								description: 'ID of the button',
							},
							{
								displayName: 'Button Text',
								name: 'buttonText',
								type: 'string',
								default: '',
								description: 'Text of the button',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: IDataObject[] = [];
		const items = this.getInputData();

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const credentials = await this.getCredentials('evolutionApi');

				if (!credentials) {
					throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
				}

				let endpoint = '';
				let method = 'POST';
				let body: IDataObject = {};
				const number = this.getNodeParameter('number', i) as string;
				const instanceName = this.getNodeParameter('instanceName', i) as string;

				if (resource === 'message') {
					switch (operation) {
						case 'sendText':
							endpoint = `/message/sendText/${instanceName}`;
							body = {
								number,
								text: this.getNodeParameter('text', i) as string,
							};
							break;

						case 'sendImage':
							endpoint = `/message/sendImage/${instanceName}`;
							body = {
								number,
								image: this.getNodeParameter('mediaUrl', i) as string,
								caption: this.getNodeParameter('caption', i) as string,
							};
							break;

						case 'sendVideo':
							endpoint = `/message/sendVideo/${instanceName}`;
							body = {
								number,
								video: this.getNodeParameter('mediaUrl', i) as string,
								caption: this.getNodeParameter('caption', i) as string,
							};
							break;

						case 'sendAudio':
							endpoint = `/message/sendAudio/${instanceName}`;
							body = {
								number,
								audio: this.getNodeParameter('mediaUrl', i) as string,
							};
							break;

						case 'sendDocument':
							endpoint = `/message/sendDocument/${instanceName}`;
							body = {
								number,
								document: this.getNodeParameter('mediaUrl', i) as string,
								caption: this.getNodeParameter('caption', i) as string,
							};
							break;

						case 'sendContact':
							endpoint = `/message/sendContact/${instanceName}`;
							body = {
								number,
								contacts: [
									{
										name: this.getNodeParameter('contactName', i) as string,
										number: this.getNodeParameter('contactNumber', i) as string,
									},
								],
							};
							break;

						case 'sendList':
							endpoint = `/message/sendList/${instanceName}`;
							const sections = this.getNodeParameter('sections.sectionValues', i) as {
								title: string;
								rows: {
									rowValues: {
										title: string;
										description?: string;
										rowId?: string;
									}[];
								};
							}[];

							body = {
								number,
								title: this.getNodeParameter('title', i) as string,
								description: this.getNodeParameter('description', i) as string,
								buttonText: this.getNodeParameter('buttonText', i) as string,
								footerText: this.getNodeParameter('footerText', i) as string,
								sections: sections.map(section => ({
									title: section.title,
									rows: section.rows.rowValues.map(row => ({
										title: row.title,
										description: row.description || '',
										rowId: row.rowId || `${section.title}_${row.title}`
									}))
								}))
							};
							break;

						case 'sendButton':
							endpoint = `/message/sendButton/${instanceName}`;
							const buttons = this.getNodeParameter('buttons', i) as IDataObject;
							const buttonItems = (buttons.buttonItems as IDataObject[]) || [];

							body = {
								number,
								title: this.getNodeParameter('buttonTitle', i) as string,
								text: this.getNodeParameter('buttonText', i) as string,
								buttons: buttonItems.map((button: IDataObject) => ({
									id: (button.buttonId as string) || `button_${Date.now()}`,
									body: (button.buttonText as string) || 'Botão',
								})),
							};
							break;
					}
				} else if (resource === 'chat') {
					switch (operation) {
						case 'verifyNumber':
							endpoint = `/chat/findNumber/${instanceName}`;
							method = 'GET';
							body = {
								number,
							};
							break;
					}
				}

				// Ensure the URL is properly formatted
				const baseUrl = credentials['server-url'] as string;
				if (!baseUrl) {
					throw new Error('Server URL is required. Please configure the credentials.');
				}
				const fullUrl = baseUrl.endsWith('/')
					? `${baseUrl.slice(0, -1)}${endpoint}`
					: `${baseUrl}${endpoint}`;

				const response = await axios({
					method,
					url: fullUrl,
					headers: {
						'Content-Type': 'application/json',
						apikey: credentials.apikey as string,
					},
					data: method === 'POST' ? body : undefined,
					params: method === 'GET' ? body : undefined,
				});

				returnData.push(response.data);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
