import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import AlunoDAO from "../daos/AlunosDAO.mjs";
import AutoresDAO from "../daos/AutoresDAO.mjs";
import EmprestimoDAO from "../daos/EmprestimoDAO.mjs";

export default function Relatorio() {
  const [alunos, setAlunos] = useState([]);
  const [autores, setAutores] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function buscarDados() {
    try {
      setLoading(true);

      const [alunosData, autoresData, emprestimosData] = await Promise.all([
        new AlunoDAO().carregarAlunos(),
        new AutoresDAO().carregarAutores(),
        new EmprestimoDAO().carregarEmprestimos(),
      ]);

      setAlunos(alunosData || []);
      setAutores(autoresData || []);
      setEmprestimos(emprestimosData || []);
    } catch (err) {
      setError("Erro ao carregar dados");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarDados();
  }, []);

  const data = [
    { nome: "Alunos", quantidade: alunos.length },
    { nome: "Autores", quantidade: autores.length },
    { nome: "Empréstimos", quantidade: emprestimos.length },
  ];

  if (loading) {
    return <div className="p-4 text-center">Carregando dados...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Relatório Geral</h2>
      <div className="h-90">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="nome"
              label={{
                value: "Categorias",
                position: "insideBottomRight",
                offset: -2,
                style: { fontSize: 12, marginBottom: 10},
              }}
            />
            <YAxis
              label={{
                value: "Quantidade",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                style: { textAnchor: "middle", fontSize: 12 },
              }}
            />
            <Tooltip
              formatter={(value) => [`${value} itens`, "Quantidade"]}
              labelFormatter={(label) => `Categoria: ${label}`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingTop: 10 }}
            />
            <Bar
              dataKey="quantidade"
              name="Quantidade"
              fill="#4F46E5"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-700">Total de Alunos</h3>
          <p className="text-2xl font-bold text-blue-900">{alunos.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-700">Total de Autores</h3>
          <p className="text-2xl font-bold text-green-900">{autores.length}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-700">Empréstimos Realizados</h3>
          <p className="text-2xl font-bold text-purple-900">
            {emprestimos.length}
          </p>
        </div>
      </div>
    </div>
  );
}
