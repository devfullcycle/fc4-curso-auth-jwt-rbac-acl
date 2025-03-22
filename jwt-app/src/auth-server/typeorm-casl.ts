import { rulesToQuery } from "@casl/ability/extra";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { AppAbility } from "./permissions";

/**
 * Transforma a consulta CASL para formato compatível com TypeORM QueryBuilder
 * Lida com operadores especiais e relacionamentos aninhados
 */
function transformQuery(query: any) {
  if (!query) return null;

  // Para estruturas OR
  if (query.$or && Array.isArray(query.$or)) {
    return {
      or: query.$or.map((condition: any) => transformQueryCondition(condition)),
    };
  }

  // Para estruturas AND
  if (query.$and && Array.isArray(query.$and)) {
    return {
      and: query.$and.map((condition: any) =>
        transformQueryCondition(condition)
      ),
    };
  }

  // Para condições simples
  return transformQueryCondition(query);
}

/**
 * Transforma uma condição individual para formato TypeORM
 */
function transformQueryCondition(condition: any) {
  const result: Record<string, any> = {};

  for (const key in condition) {
    if (key.startsWith("$")) {
      // Ignora operadores de alto nível - tratados separadamente
      continue;
    }

    const value = condition[key];

    // Verifica se o valor é um objeto de operadores ($eq, $in, etc.)
    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Verifica se há operadores especiais
      const hasOperators = Object.keys(value).some((k) => k.startsWith("$"));

      if (hasOperators) {
        // Transforma os operadores para formato TypeORM
        // No QueryBuilder vamos lidar com isto de forma customizada
        result[key] = value;
      } else {
        // Objeto sem operadores, mantém como está
        result[key] = value;
      }
    } else {
      // Valor simples, mantém como está
      result[key] = value;
    }
  }

  return result;
}

function ruleToTypeOrm(rule: any): any {
  return rule.inverted ? { not: rule.conditions } : rule.conditions;
}

/**
 * Converte regras CASL para um formato que pode ser usado com TypeORM QueryBuilder
 * Aplica diretamente as condições no queryBuilder, incluindo joins e where
 */
export function toTypeOrmQuery<T extends ObjectLiteral>(
  ability: AppAbility,
  action: any,
  resource: any,
  queryBuilder: SelectQueryBuilder<T>
): SelectQueryBuilder<T> {
  const query = rulesToQuery(ability, action, resource, ruleToTypeOrm);
  console.log(query);
  if (query === null) {
    return queryBuilder;
  }

  const conditions = transformQuery(query);
  console.log(conditions);
  // Aplica as condições ao queryBuilder
  applyConditionsToQueryBuilder(conditions, queryBuilder);

  return queryBuilder;
}

/**
 * Aplica condições ao queryBuilder, incluindo joins para relacionamentos
 */
function applyConditionsToQueryBuilder<T extends ObjectLiteral>(
  conditions: any,
  queryBuilder: SelectQueryBuilder<T>
): SelectQueryBuilder<T> {
  // Return the queryBuilder
  const rootAlias = queryBuilder.expressionMap.mainAlias?.name || "entity";

  // Processa condições OR
  if (conditions?.or && Array.isArray(conditions.or)) {
    const orParams: any = {};
    const orExpressions: string[] = [];

    conditions.or.forEach((condition: any, index: number) => {
      const { expression, params } = buildWhereExpression(
        condition,
        `or${index}`,
        rootAlias,
        queryBuilder
      );

      if (expression) {
        orExpressions.push(`(${expression})`);
        Object.assign(orParams, params);
      }
    });

    if (orExpressions.length > 0) {
      queryBuilder = queryBuilder.where(
        `(${orExpressions.join(" OR ")})`,
        orParams
      );
    }
  }
  // Processa condições AND
  else if (conditions?.and && Array.isArray(conditions.and)) {
    conditions.and.forEach((condition: any, index: number) => {
      const { expression, params } = buildWhereExpression(
        condition,
        `and${index}`,
        rootAlias,
        queryBuilder
      );

      if (expression) {
        if (index === 0) {
          queryBuilder = queryBuilder.where(expression, params);
        } else {
          queryBuilder = queryBuilder.andWhere(expression, params);
        }
      }
    });
  }
  // Processa condição simples
  else if (conditions) {
    const { expression, params } = buildWhereExpression(
      conditions,
      "condition",
      rootAlias,
      queryBuilder
    );

    if (expression) {
      queryBuilder = queryBuilder.where(expression, params);
    }
  }

  return queryBuilder;
}

// Adicione esta função de validação
function isValidIdentifier(name: string): boolean {
  // Verifica se o nome só contém caracteres alfanuméricos e underscore
  return /^[a-zA-Z0-9_]+$/.test(name);
}

function buildWhereExpression<T extends ObjectLiteral>(
  condition: any,
  paramPrefix: string,
  rootAlias: string,
  queryBuilder: SelectQueryBuilder<T>
): { expression: string; params: any } {
  const expressions: string[] = [];
  const params: any = {};
  const usedJoins: Set<string> = new Set();

  Object.entries(condition).forEach(([path, value], index) => {
    // Gerencia caminhos de relacionamento (com pontos)
    if (path.includes(".")) {
      const parts = path.split(".");
      const field = parts.pop() as string;

      // Validar cada parte do caminho
      if (!parts.every(isValidIdentifier) || !isValidIdentifier(field)) {
        console.warn(`Ignorando caminho potencialmente perigoso: ${path}`);
        return; // Pula esta condição
      }

      // Processa o relacionamento e adiciona os joins necessários
      let currentAlias = rootAlias;
      let fullPath = "";

      // Adiciona joins para cada nível de relacionamento
      for (let i = 0; i < parts.length; i++) {
        const relationName = parts[i];
        fullPath = fullPath ? `${fullPath}_${relationName}` : relationName;

        // Verifica se o join já foi adicionado
        const joinPath = `${currentAlias}.${relationName}`;
        if (!usedJoins.has(joinPath)) {
          queryBuilder.leftJoinAndSelect(joinPath, fullPath);
          usedJoins.add(joinPath);
        }

        currentAlias = fullPath;
      }

      // Adiciona a condição para o campo específico no último nível do relacionamento
      const paramName = `${paramPrefix}_${parts.join("_")}_${field}`;
      expressions.push(`${currentAlias}.${field} = :${paramName}`);
      params[paramName] = value;
    } else {
      // Validar o nome do campo
      if (!isValidIdentifier(path)) {
        console.warn(`Ignorando campo potencialmente perigoso: ${path}`);
        return; // Pula esta condição
      }

      // Condição direta sem relacionamentos
      const paramName = `${paramPrefix}_${path}_${index}`;
      expressions.push(`${rootAlias}.${path} = :${paramName}`);
      params[paramName] = value;
    }
  });

  return {
    expression: expressions.length > 0 ? expressions.join(" AND ") : "",
    params,
  };
}
