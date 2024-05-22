describe('drawdb.spec', () => {
  it('should do something', async () => {
    const types: string[] = []
    const code: string[] = []

    // eslint-disable-next-line ts/no-use-before-define
    for (const table of sample.tables) {
      types.push(`export interface ${table.name} {`)
      for (const field of table.fields)
        types.push(`  ${field.name}: ${field.type}`)
      types.push(`}`)
      types.push(``)
    }

    expect(types.join('\n')).toMatchInlineSnapshot(`
      "export interface events {
        id: INT
        title: TEXT
        active: BOOLEAN
        uid: UUID
      }
      export interface service {
        id: INT
        title: VARCHAR
        event: INT
      }"
    `)
  })
})

const sample = {
  author: 'Unnamed',
  title: 'Beispiel1',
  date: '2024-05-22T06:43:23.028Z',
  tables: [
    {
      id: 0,
      name: 'events',
      x: 301,
      y: 41,
      fields: [
        {
          name: 'id',
          type: 'INT',
          default: '',
          check: '',
          primary: true,
          unique: true,
          notNull: true,
          increment: true,
          comment: '',
          id: 0,
        },
        {
          name: 'title',
          type: 'TEXT',
          default: '',
          check: '',
          primary: false,
          unique: false,
          notNull: false,
          increment: false,
          comment: '',
          id: 1,
          size: 65535,
          values: [],
        },
        {
          name: 'active',
          type: 'BOOLEAN',
          default: '',
          check: '',
          primary: false,
          unique: false,
          notNull: false,
          increment: false,
          comment: '',
          id: 2,
          size: '',
          values: [],
        },
        {
          name: 'uid',
          type: 'UUID',
          default: '',
          check: '',
          primary: false,
          unique: false,
          notNull: false,
          increment: false,
          comment: '',
          id: 3,
          size: '',
          values: [],
        },
      ],
      comment: '',
      indices: [],
      color: '#175e7a',
      key: 1716359881806,
    },
    {
      id: 1,
      name: 'service',
      x: 661.3945578231294,
      y: 175.04761904761904,
      fields: [
        {
          name: 'id',
          type: 'INT',
          default: '',
          check: '',
          primary: true,
          unique: true,
          notNull: true,
          increment: true,
          comment: '',
          id: 0,
        },
        {
          name: 'title',
          type: 'VARCHAR',
          default: '',
          check: '',
          primary: false,
          unique: false,
          notNull: false,
          increment: false,
          comment: '',
          id: 1,
          size: 255,
        },
        {
          name: 'event',
          type: 'INT',
          default: '',
          check: '',
          primary: false,
          unique: false,
          notNull: false,
          increment: false,
          comment: '',
          id: 2,
        },
      ],
      comment: 'Bezeichnung des Services',
      indices: [],
      color: '#ff9159',
      key: 1716359966289,
    },
  ],
  relationships: [
    {
      startTableId: 1,
      startFieldId: 2,
      endTableId: 0,
      endFieldId: 0,
      cardinality: 'Eins zu viele',
      updateConstraint: 'No action',
      deleteConstraint: 'No action',
      name: 'service_event_fk',
      id: 0,
    },
  ],
  notes: [],
  subjectAreas: [],
  types: [],
}
