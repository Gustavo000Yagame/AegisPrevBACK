-- Schema do AegisPrev (equivalente ao gerado antes pelo Hibernate)
-- Rode este arquivo uma vez no seu banco (npm run migrate faz isso automaticamente).

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    papeis VARCHAR(20) NOT NULL CHECK (papeis IN ('ROLE_ADMIN', 'ROLE_MEDICO')),
    admin_date TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS medico (
    id_medico SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sexo VARCHAR(20) NOT NULL,
    idade INTEGER NOT NULL,
    id_usuario INTEGER UNIQUE NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS paciente (
    id_paciente SERIAL PRIMARY KEY,
    nome_paciente VARCHAR(255) NOT NULL,
    cpf_paciente VARCHAR(20) UNIQUE NOT NULL,
    data_nascimento DATE
);

CREATE TABLE IF NOT EXISTS doenca (
    id_doenca SERIAL PRIMARY KEY,
    nome_doenca VARCHAR(255) NOT NULL,
    descricao_doenca TEXT,
    hereditaria BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS sintoma (
    id_sintoma SERIAL PRIMARY KEY,
    nome_sintoma VARCHAR(255) NOT NULL,
    descricao_sintoma TEXT
);

CREATE TABLE IF NOT EXISTS doenca_sintoma (
    id_doenca INTEGER NOT NULL REFERENCES doenca(id_doenca) ON DELETE CASCADE,
    id_sintoma INTEGER NOT NULL REFERENCES sintoma(id_sintoma) ON DELETE CASCADE,
    PRIMARY KEY (id_doenca, id_sintoma)
);

CREATE TABLE IF NOT EXISTS consulta (
    id_consulta SERIAL PRIMARY KEY,
    id_medico INTEGER NOT NULL REFERENCES medico(id_medico),
    id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente),
    data_consulta TIMESTAMP NOT NULL DEFAULT now(),
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS consulta_sintoma (
    consulta_id INTEGER NOT NULL REFERENCES consulta(id_consulta) ON DELETE CASCADE,
    sintoma_id INTEGER NOT NULL REFERENCES sintoma(id_sintoma) ON DELETE CASCADE,
    PRIMARY KEY (consulta_id, sintoma_id)
);

CREATE TABLE IF NOT EXISTS consulta_doenca (
    consulta_id INTEGER NOT NULL REFERENCES consulta(id_consulta) ON DELETE CASCADE,
    doenca_id INTEGER NOT NULL REFERENCES doenca(id_doenca) ON DELETE CASCADE,
    PRIMARY KEY (consulta_id, doenca_id)
);
